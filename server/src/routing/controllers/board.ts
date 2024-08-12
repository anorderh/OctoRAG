import { Request, Response } from "express";
import { Authorize, Controller, Delete, Get, Patch, Post } from "../decorators";
import { inject, singleton } from "tsyringe";
import { ControllerBase } from "../../utils/abstract/controller";
import { UserService } from "../../services/user.service";
import { AuthService, MongoService } from "../../services";
import { Blanket } from "../decorators/blanket";
import morgan from "morgan";
import { Collection, ObjectId, RemoveUserOptions } from "mongodb";
import { usePagination } from "../../utils/extensions/use-pagination";
import Joi, { object } from "joi";
import { Validate } from "../decorators/validate";
import { httpContext } from "../middleware/http-context";
import { FindType } from "../../utils/enums/find-type";
import { readFileSync } from "fs";
import { SortingOption } from "../../utils/enums/board-filtering/sorting-options";
import { DateOption } from "../../utils/enums/board-filtering/date-options";
import { SearchBoardRequest } from "../../data/models/request/search-boards";
import { create } from "lodash";
import { calcDateRange } from "../../utils/extensions/calc-date-range";
import { BoardService } from "../../services/board.service";
import { AggregateOptions } from "mongodb";
import { join } from "path";
import { CollectionId } from "../../utils/enums/collection-id";
import { objectId } from "../../utils/extensions/objectid-validation";
import { filterNulls } from "../../utils/extensions/filter-nulls";
import { Board, Find, User } from "../../data/collections";


@Controller('/board')
@singleton()
export class BoardController extends ControllerBase {
    boardCollection: Collection<Board>;
    userCollection: Collection<User>;

    constructor(
        @inject(UserService) private userService: UserService,
        @inject(BoardService) private boardService: BoardService,
        @inject(MongoService) private mongo: MongoService
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
                Joi.string().valid(...Object.keys(FindType))
            ),
            excludedTypes: Joi.array().items(
                Joi.string().valid(...Object.keys(FindType))
            ),
            createdDateRange: Joi.string().valid(...Object.keys(DateOption)).required(),
            lastUpdatedDateRange: Joi.string().valid(...Object.keys(DateOption)).required(),
            sort: Joi.string().valid(...Object.keys(SortingOption)).required()
        }
    )
    public async searchBoards(req: Request, res: Response) {
        let {
            includedTypes,
            excludedTypes,
            searchStr,
            createdAtDateRange,
            updatedAtDateRange,
            tagIds,
            sort
        } = new SearchBoardRequest(req.body).input;

        let pipeline: any[] = [];
        // Optional filtering.
        // Ensure boards have these file types.
        if (!!includedTypes && includedTypes.length > 0) {
            pipeline.concat([
                {
                    $match: {
                        finds: {
                            $elemMatch: {
                                type: { $in: includedTypes}
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
                                    $not: [ {$in: includedTypes} ]
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
        if (!!tagIds && tagIds.length > 0) {
            pipeline.push({
                $match: {
                    $setIsSubset: ["$tags", tagIds]
                }
            })
        }

        // Required Filtering.
        // Apply date range for creation date.
        if (createdAtDateRange != DateOption.ALL_TIME) {
            let [startDate, endDate] = calcDateRange(createdAtDateRange)
            pipeline.push({
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate}
                }
            })
        }
        // Apply date range for updated date.
        if (updatedAtDateRange != DateOption.ALL_TIME) {
            let [startDate, endDate] = calcDateRange(updatedAtDateRange)
            pipeline.push({
                $match: {
                    updatedAt: { $gte: startDate, $lte: endDate}
                }
            })
        }
        // Apply sorting option.
        switch (sort) {
            case SortingOption.MOST_POPULAR: {
                pipeline.push({
                    $sort: { views: -1 }
                })
                break;
            }
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
        }
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
        // Apply visibility constraints.
        pipeline.push({
            $match: {
                public: true
            }
        })

        let boards = await this.boardCollection.aggregate(pipeline).toArray();
        res.status(200).send(boards);
    }

    @Post('/add')
    @Authorize()
    @Validate(
        'body', {
            board: Joi.object({
                _id: objectId.required(),
                title: Joi.string().required(),
                desc: Joi.string(),
                tags: Joi.array().items(Joi.string()),
                public: Joi.boolean().required()
            }),
        },
    )
    public async addBoard(req: Request, res: Response) {
        let userId = httpContext().userId;

        let [createdAt, updatedAt]  = [new Date(), new Date()]
        await this.boardCollection.insertOne({
            _id: req.body._id,
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
        })
        res.status(200).send("Board added.")
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
            _id: objectId.required(),
            title: Joi.string().required(),
            desc: Joi.string(),
            finds: Joi.array().items(
                Joi.object({
                    _id: objectId.required(),
                    title: Joi.string().required(),
                    desc: Joi.string(),
                    link: Joi.string().required(),
                    relations: Joi.array().items(
                        Joi.object({
                            _id: objectId.required(),
                            destFind: objectId.required(),
                            label: Joi.string().required(),
                            desc: Joi.string()
                        })
                    ),
                    grouping: Joi.array().items(Joi.string()),
                    level: Joi.number().required(),
                })
            ).min(1).required(),
        }
    )
    public async addVersion(req: Request, res: Response) {
        // Confirm board's existence.
        let boardId = new ObjectId(req.params._id);
        let board = await this.boardService.getBoard(boardId);
        
        let [createdAt, updatedAt]  = [new Date(), new Date()]
        await this.boardCollection.updateOne({
            _id: boardId
        }, {
            $push: {
                versions: {
                    _id: req.body.id,
                    index: req.body.index,
                    desc: req.body.desc,
                    finds: req.body.finds.map((f: Find) => {
                        return {
                            _id: f._id,
                            title: f.title,
                            desc: f.desc,
                            link: f.link,
                            relations: f.relations,
                            grouping: f.grouping,
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
        })
        res.status(200).send("Version added.")
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
        let boardId = new ObjectId(req.params._id);
        let board = await this.boardService.getBoard(boardId);

        // Update board.
        let updatedAt = Date.now()
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
        res.status(200).send("Board edited.");
    }

    @Patch('/edit/:_id/version')
    @Authorize()
    @Validate(
        'params', {
            _id: objectId.required(),
        }
    )
    @Validate(
        'body', {
            _id: objectId.required(),
            title: Joi.string(),
            desc: Joi.string(),
            finds: Joi.array().items(
                Joi.object({
                    _id: objectId.required(),
                    title: Joi.string().required(),
                    desc: Joi.string(),
                    link: Joi.string().required(),
                    relations: Joi.array().items(
                        Joi.object({
                            _id: objectId.required(),
                            destFind: objectId.required(),
                            label: Joi.string().required(),
                            desc: Joi.string()
                        })
                    ),
                    grouping: Joi.array().items(Joi.string()),
                    level: Joi.number().required(),
                })
            ).min(1).required(),
        },
    )
    public async editVersion(req: Request, res: Response) {
        // Confirm board's existence.
        let boardId = new ObjectId(req.params._id);
        let board = await this.boardService.getBoard(boardId);

        // Update version and its associated finds.
        let versionId = new ObjectId(req.body._id);
        let updatedAt = Date.now()
        await this.boardCollection.updateOne(
            { _id: boardId, "versions._id": versionId},
            {
                $set: filterNulls({
                    "versions.$.title": req.body.title,
                    "versions.$.desc": req.body.desc,
                    updatedAt: updatedAt,
                })
            }
        );
        for (let find of req.body.finds) {
            await this.boardCollection.updateOne(
                { 
                    _id: boardId, 
                    "versions._id": versionId,
                    "versions.finds._id": find._id
                }, {
                    "versions.$.finds.$.title": find.title,
                    "versions.$.finds.$.desc": find.desc,
                    "versions.$.finds.$.link": find.link,
                    "versions.$.finds.$.relations": find.relations,
                    "versions.$.finds.$.grouping": find.grouping,
                    "versions.$.finds.$.level": find.level,
                    updatedAt: updatedAt
                }
            )
        }
        res.status(200).send("Board edited.");
    }

    @Post('/publish/:_id/version/:_ver_id')
    @Authorize()
    @Validate(
        'params', {
            _id: objectId.required(),
            _ver_id: objectId.required()
        }
    )
    public async publishVersion(req: Request, res: Response) {
        // Confirm board's existence.
        let boardId = new ObjectId(req.params._id);
        let board = await this.boardService.getBoard(boardId);

        // Update relationships.
        let versionId = new Object(req.params._ver_id)
        await this.boardCollection.updateOne({
            _id: boardId,
            'versions._id': versionId
        }, {
            $set: {
                'versions.$.published': true
            }
        })
        res.status(200).send("Board followed.");
    }

    @Delete('/:_id/delete')
    @Authorize()
    @Validate(
        'params', {
            _id: objectId.required()
        }
    ) 
    public async deleteBoard(req: Request, res: Response) {
        // Confirm board's existence.
        let boardId = new ObjectId(req.params._id);
        let board = await this.boardService.getBoard(boardId);

        // Delete board & remove following users' relationships.
        await this.boardCollection.deleteOne({
            _id: boardId
        });
        await this.userCollection.updateMany(
            {
                boardsFollowed: {
                    $elemMatch: boardId
                }, 
            },
            {
                $pull: {
                    boardsFollowed: boardId
                }
            }
        );
        res.status(200).send("Board deleted");
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
        let board = await this.boardService.getBoard(boardId);

        // Remove version.
        let versionId = new Object(req.params._ver_id)
        await this.boardCollection.updateOne({
            _id: boardId
        }, {
            $pull: {
                versions: {
                    _id: versionId
                }
            }
        });
        res.status(200).send("Version deleted");
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
        let board = await this.boardService.getBoard(boardId, false);

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
        res.status(200).send("Board followed.");
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
        let board = await this.boardService.getBoard(boardId, false);

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
        res.status(200).send("Board unfollowed.");
    }

    @Get('/:_id')
    @Validate(
        'params', {
            _id: objectId.required()
        }
    ) 
    public async getBoard(req: Request, res: Response) {
        let boardId = new ObjectId(req.params._id);
        let board = await this.boardService.getBoard(boardId, false);

        res.status(200).send(board);
    }
}