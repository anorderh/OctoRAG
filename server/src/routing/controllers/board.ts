import { Request, Response } from "express";
import { Authorize, Controller, Delete, Get, Patch, Post } from '../decorators';
import { inject, singleton } from "tsyringe";
import { ControllerBase } from '../../utils/abstract/controller';
import { UserService } from '../../services/user.service';
import { AuthService, MongoService } from '../../services';
import { Blanket } from '../decorators/blanket';
import morgan from "morgan";
import { Collection, ObjectId, RemoveUserOptions, WithId } from "mongodb";
import { usePagination } from '../../utils/extensions/use-pagination';
import Joi, { object } from "joi";
import { Validate } from '../decorators/validate';
import { httpContext } from '../middleware/http-context';
import { FindType } from '../../utils/enums/find-type';
import { readFileSync } from "fs";
import { SortingOption } from '../../utils/enums/board-filtering/sorting-options';
import { DateOption } from '../../utils/enums/board-filtering/date-options';
import { create } from "lodash";
import { calcDateRange } from '../../utils/extensions/calc-date-range';
import { BoardService } from '../../services/board.service';
import { AggregateOptions } from "mongodb";
import { join } from "path";
import { CollectionId } from '../../utils/enums/collection-id';
import { objectId } from '../../utils/extensions/objectid-validation';
import { filterNulls } from '../../utils/extensions/filter-nulls';
import { Board, Find, Relation, User, UserEventLog } from '../../data/collections';
import { executeMongoChecks } from '../../utils/extensions/mongo-checks';
import { hasBoardAuth, isValidBoard } from '../../utils/validation/board';
import { version } from "os";
import { EventService } from '../../services/event.service';
import { BoardEvent, UserEvent } from '../../utils/constants/event';
import { EventType } from '../../utils/enums/event-type';


@Controller('/board')
@singleton()
export class BoardController extends ControllerBase {
    boardCollection: Collection<Board>;
    userCollection: Collection<User>;

    constructor(
        @inject(UserService) private userService: UserService,
        @inject(BoardService) private boardService: BoardService,
        @inject(MongoService) private mongo: MongoService,
        @inject(EventService) private eventService: EventService
    ) {
        super()
        this.boardCollection = this.mongo.db.collection<Board>(CollectionId.Board);
        this.userCollection = this.mongo.db.collection<User>(CollectionId.User)
    }

    @Post('/search')
    @Validate(
        'body', {
            searchStr: Joi.string(),
            includedTypes: Joi.array().items(
                Joi.string().valid(...Object.values(FindType))
            ),
            excludedTypes: Joi.array().items(
                Joi.string().valid(...Object.values(FindType))
            ),
            createdAtOption: Joi.string().valid(...Object.values(DateOption)).required(),
            updatedAtOption: Joi.string().valid(...Object.values(DateOption)).required(),
            tags: Joi.array().items(Joi.string()),
            sort: Joi.string().valid(...Object.values(SortingOption)).required()
        }
    )
    public async searchBoards(req: Request, res: Response) {
        let {
            searchStr,
            includedTypes,
            excludedTypes,
            createdAtOption,
            updatedAtOption,
            tags,
            sort
        } = req.body;

        let pipeline: any[] = [];
        // Optional filtering.
        // Ensure boards have these file types.
        if (!!includedTypes && includedTypes.length > 0) {
            pipeline.concat([
                {
                    $match: {
                        finds: {
                            $elemMatch: {
                                type: {
                                    $in: includedTypes
                                }
                            }
                        }
                    }
                },
            ])
        }
        // Exclude boards with these file types.
        if (!!excludedTypes && excludedTypes.length > 0) {
            pipeline.concat([
                {
                    $match: {
                        finds: {
                            $elemMatch: {
                                type: {
                                    $nin: includedTypes
                                }
                            }
                        }
                    }
                },
            ])
        }
        // Apply search string.
        if (!!searchStr && searchStr != "") {
            pipeline.push({
                $regexMatch: {
                    input: "$title",
                    regex: `/${searchStr}/ `
                } 
            })
        }
        // If provided, ensure boards have all provided tags.
        if (!!tags && tags.length > 0) {
            pipeline.push({
                $match: {
                    tags: {
                        $all: tags
                    }
                }
            })
        }

        // Required Filtering.
        // Apply date range for creation date.
        if (!!createdAtOption && createdAtOption != DateOption.ALL_TIME) {
            let [startDate, endDate] = calcDateRange(createdAtOption)
            pipeline.push({
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate}
                }
            })
        }
        // Apply date range for updated date.
        if (!!updatedAtOption && updatedAtOption != DateOption.ALL_TIME) {
            let [startDate, endDate] = calcDateRange(updatedAtOption)
            pipeline.push({
                $match: {
                    updatedAt: { $gte: startDate, $lte: endDate}
                }
            })
        }
        // Apply sorting option.
        switch (sort) {
            case SortingOption.MOST_SAVED: {
                pipeline.push({
                    $sort: { saves: -1 }
                })
                break;
            }
            case SortingOption.NEWEST: {
                pipeline.push({
                    $sort: { createdAt: -1 }
                })
                break;
            }
            default: { // SortingOption.MOST_POPULAR
                pipeline.push({
                    $sort: { views: -1 }
                })
                break;
            }
        }
        // Apply visibility constraints.
        pipeline.push({
            $match: {
                public: true
            }
        })
        // Apply pagination.
        let pag = usePagination(req);
        pipeline.concat([
            {
                $skip: pag.skip,
            },
            {
                $limit: pag.limit
            }
        ])

        let boards = await this.boardCollection.aggregate(pipeline).toArray();
        res.status(200).send(boards);
    }

    @Post('/add')
    @Authorize()
    @Validate(
        'body', {
            title: Joi.string().required(),
            desc: Joi.string(),
            tags: Joi.array().items(Joi.string()),
            public: Joi.boolean().required()
        },
    )
    public async addBoard(req: Request, res: Response) {
        let userId = httpContext().userId;

        let [createdAt, updatedAt]  = [new Date(), new Date()]
        let board = await this.boardCollection.insertOne({
            _id: new ObjectId(),
            title: req.body.title,
            desc: req.body.desc,
            creatorId: userId,
            followers: [],
            versions: [],
            tags: req.body.tags ?? [],
            saves: 0,
            createdAt: createdAt,
            updatedAt: updatedAt,
            active: true,
            public: req.body.public
        });

        // Track event.
        await this.eventService.postEvent(EventType.User, {
            event: UserEvent.CreatedBoard,
            userId: userId,
            ref: board.insertedId
        });

        res.status(200).send({
            msg: "Board added",
            _id: board.insertedId
        })
    }

    @Post('/add/:_id/version')
    @Authorize()
    @Validate(
        'params', {
            _id: objectId.required()
        }
    )
    @Validate(
        'body', {
            title: Joi.string().required(),
            desc: Joi.string(),
            finds: Joi.array().items(
                Joi.object({
                    title: Joi.string().required(),
                    index: Joi.number().required(),
                    desc: Joi.string(),
                    link: Joi.string().required(),
                    relations: Joi.array().items(
                        Joi.object({
                            destIdx: Joi.number().required(),
                            label: Joi.string().required(),
                            desc: Joi.string()
                        })
                    ).default([]),
                    grouping: Joi.array().items(Joi.string()),
                    rank: Joi.number().required(),
                })
            ).min(1).required(),
        }
    )
    public async addVersion(req: Request, res: Response) {
        // Confirm board's existence.
        let boardId = new ObjectId(req.params._id);
        let board: Board = await this.boardCollection.findOne({
            _id: boardId
        }).then(executeMongoChecks<Board>([
            isValidBoard,
            hasBoardAuth
        ]))
        
        // Generate hidden properties server-side.
        let versionIdx = board.versions.length + 1;
        let [createdAt, updatedAt]  = [new Date(), new Date()]

        let versionId = new ObjectId();
        await this.boardCollection.updateOne({
            _id: boardId
        }, {
            $push: {
                versions: {
                    _id: versionId,
                    index: versionIdx,
                    desc: req.body.desc,
                    finds: req.body.finds.map((f: Find) => {
                        return {
                            _id: new ObjectId(),
                            title: f.title,
                            desc: f.desc,
                            link: f.link,
                            index: f.index,
                            type: FindType.Other,
                            relations: f.relations.map((r: Relation) => {
                                return {
                                    destIdx: r.destIdx,
                                    label: r.label,
                                    desc: r.desc
                                }
                            }),
                            grouping: f.grouping,
                            rank: f.rank,
                            views: 0,
                            clicks: 0,
                            createdAt: createdAt,
                            updatedAt: updatedAt,
                            active: true
                        } as Find
                    }),
                    visits: 0,
                    createdAt: createdAt,
                    updatedAt: updatedAt,
                    active: true,
                    published: false
                }
            }
        });
        
        res.status(200).send({
            msg: "Version added.",
            _id: versionId
        })
    }

    @Patch('/edit/:_id')
    @Authorize()
    @Validate(
        'params', {
            _id: objectId.required(),
        }
    )
    @Validate(
        'body', {
            title: Joi.string(),
            desc: Joi.string(),
            tags: Joi.array().items(Joi.string())
        },
    )
    public async editBoard(req: Request, res: Response) {
        // Confirm board's existence.
        let userId = httpContext().userId;
        let boardId = new ObjectId(req.params._id);
        let board: Board = await this.boardCollection.findOne({
            _id: boardId
        }).then(executeMongoChecks<Board>([
            isValidBoard,
            hasBoardAuth
        ]))

        // Update board.
        let updatedAt = new Date();
        await this.boardCollection.updateOne(
            { _id: boardId },
            {
                $set: filterNulls({
                    title: req.body.title,
                    desc: req.body.desc,
                    tags: req.body.tags,
                    updatedAt: updatedAt,
                })
            }
        );

        // Track events.
        await this.eventService.postEvent(EventType.Board, {
            event: BoardEvent.Updated,
            boardId: boardId,
        });
        await this.eventService.postEvent(EventType.User, {
            event: UserEvent.UpdatedBoard,
            userId: userId,
            ref: boardId
        });

        res.status(200).send({
            msg: "Board edited.",
            _id: boardId
        })
    }

    @Patch('/edit/:_id/version/:_ver_id')
    @Authorize()
    @Validate(
        'params', {
            _id: objectId.required(),
            _ver_id: objectId.required()
        }
    )
    @Validate(
        'body', {
            title: Joi.string(),
            desc: Joi.string(),
            finds: Joi.array().items(
                Joi.object({
                    _id: objectId,
                    index: Joi.number().required(),
                    title: Joi.string().required(),
                    desc: Joi.string(),
                    link: Joi.string().required(),
                    relations: Joi.array().items(
                        Joi.object({
                            destIdx: Joi.number().required(),
                            label: Joi.string().required(),
                            desc: Joi.string()
                        })
                    ).default([]),
                    grouping: Joi.array().items(Joi.string()),
                    rank: Joi.number().required(),
                })
            ).min(1).required(),
        },
    )
    public async editVersion(req: Request, res: Response) {
        // Confirm board's existence.
        let userId = httpContext().userId;
        let boardId = new ObjectId(req.params._id);
        let versionId = new ObjectId(req.params._ver_id);
        let board = await this.boardCollection.findOne({
            _id: boardId,
            "versions._id": versionId
        }).then(executeMongoChecks<Board>([
            isValidBoard,
            hasBoardAuth
        ]));

        // Update version and its associated finds.
        let version = board.versions.find(v => v._id.equals(versionId));
        let updatedAt = new Date();
        await this.boardCollection.updateOne(
            { _id: boardId, "versions._id": versionId},
            {
                $set: filterNulls({
                    "versions.$.title": req.body.title,
                    "versions.$.desc": req.body.desc,
                    "versions.$.finds": req.body.finds.map((f: Find) => {
                        return {
                            _id: new ObjectId(),
                            title: f.title,
                            index: f.index,
                            desc: f.desc,
                            link: f.link,
                            relations: f.relations,
                            grouping: f.grouping,
                            rank: f.rank,
                            type: FindType.Other,
                            views: 0,
                            clicks: 0,
                            createdAt: version.createdAt,
                            updatedAt: updatedAt,
                            active: true
                        }
                    }),
                    updatedAt: updatedAt,
                })
            }
        );

        // Track events.
        await this.eventService.postEvent(EventType.Board, {
            event: BoardEvent.UpdatedVersion,
            boardId: boardId,
        });
        await this.eventService.postEvent(EventType.User, {
            event: UserEvent.UpdatedVersion,
            userId: userId,
            ref: boardId
        });

        res.status(200).send({
            msg: "Version edited.",
            _id: versionId
        })
    }

    @Post('/:_id/publish/version/:_ver_id')
    @Authorize()
    @Validate(
        'params', {
            _id: objectId.required(),
            _ver_id: objectId.required()
        }
    )
    public async publishVersion(req: Request, res: Response) {
        // Confirm board's existence.
        let userId = httpContext().userId;
        let boardId = new ObjectId(req.params._id);
        let board: Board = await this.boardCollection.findOne({
            _id: boardId
        }).then(executeMongoChecks<Board>([
            isValidBoard,
            hasBoardAuth
        ]))

        // Confirm version's existence.
        let versionId = new ObjectId(req.params._ver_id)
        if (!board.versions.map(v => v._id).some(id => id.equals(versionId))) {
            res.status(409).send("Specified version does not exist.");
            return;
        }

        // Update relationships.
        await this.boardCollection.updateOne({
            _id: boardId,
            'versions._id': versionId
        }, {
            $set: {
                'versions.$.published': true
            }
        })

        // Track events.
        await this.eventService.postEvent(EventType.Board, {
            event: BoardEvent.PublishedVersion,
            boardId: boardId,
        });
        await this.eventService.postEvent(EventType.User, {
            event: UserEvent.PublishedVersion,
            userId: userId,
            ref: boardId
        });

        res.status(200).send({
            msg: "Version published",
            _id: versionId
        });
    }

    @Delete('/delete/:_id')
    @Authorize()
    @Validate(
        'params', {
            _id: objectId.required()
        }
    ) 
    public async deleteBoard(req: Request, res: Response) {
        // Confirm board's existence.
        let boardId = new ObjectId(req.params._id);
        let board: Board = await this.boardCollection.findOne({
            _id: boardId
        }).then(executeMongoChecks<Board>([
            isValidBoard,
            hasBoardAuth
        ]))

        // Delete board & remove following users' relationships.
        await this.boardCollection.deleteOne({
            _id: boardId
        });
        await this.userCollection.updateMany(
            {
                boardsFollowed: boardId
            },
            {
                $pull: {
                    boardsFollowed: boardId
                }
            }
        );
        res.status(200).send({
            msg: "Board deleted",
            _id: boardId
        });
    }

    @Delete('/delete/:_id/version/:_ver_id')
    @Authorize()
    @Validate(
        'params', {
            _id: objectId.required(),
            _ver_id: objectId.required()
        }
    )
    public async deleteVersion(req: Request, res: Response) {
        // Confirm board's existence.
        let boardId = new ObjectId(req.params._id);
        let board: Board = await this.boardCollection.findOne({
            _id: boardId,
        }).then(executeMongoChecks<Board>([
            isValidBoard,
            hasBoardAuth
        ]))

        // Confirm version's existence.
        let versionId = new ObjectId(req.params._ver_id)
        if (!board.versions.map(v => v._id).some(id => id.equals(versionId))) {
            res.status(409).send("Specified version does not exist.")
            return;
        }

        await this.boardCollection.updateOne({
            _id: boardId
        }, {
            $pull: {
                versions: {
                    _id: versionId
                }
            }
        });
        res.status(200).send({
            msg: "Version deleted",
            _id: versionId
        });
    }

    @Post('/follow/:_id')
    @Authorize()
    @Validate(
        'params', {
            _id: objectId.required()
        }
    )
    public async followBoard(req: Request, res: Response) {
        let boardId = new ObjectId(req.params._id);
        let userId = httpContext().userId;

        // Confirm board existence.
        let board: Board = await this.boardCollection.findOne({
            _id: boardId
        }).then(executeMongoChecks<Board>([
            isValidBoard
        ]))

        // Update relationships.
        await this.boardCollection.updateOne({
            _id: boardId
        }, {
            $push: {
                followers: userId
            }
        });
        await this.userCollection.updateOne({
            _id: userId
        }, {
            $push: {
                followers: boardId
            }
        })
        res.status(200).send({
            msg: "Board followed",
            _id: boardId
        });
    }

    @Post('/unfollow/:_id')
    @Authorize()
    @Validate(
        'params', {
            _id: objectId.required()
        }
    )
    public async unfollowBoard(req: Request, res: Response) {
        let boardId = new ObjectId(req.params._id);
        let userId = httpContext().userId;

        // Confirm board existence.
        let board: Board = await this.boardCollection.findOne({
            _id: boardId
        }).then(executeMongoChecks<Board>([
            isValidBoard
        ]))

        // Update relationships.
        await this.boardCollection.updateOne({
            _id: boardId
        }, {
            $pull: {
                followers: userId
            }
        });
        await this.userCollection.updateOne({
            _id: userId
        }, {
            $pull: {
                boardsFollowed: boardId
            }
        })
        res.status(200).send({
            msg: "Board unfollowed",
            _id: boardId
        });
    }

    @Get('/:_id')
    @Validate(
        'params', {
            _id: objectId.required()
        }
    ) 
    public async getBoard(req: Request, res: Response) {
        let boardId = new ObjectId(req.params._id);
        let board: Board = await this.boardCollection.findOne({
            _id: boardId
        }).then(executeMongoChecks<Board>([
            isValidBoard
        ]))

        res.status(200).send(board);
    }
}