import { Request, Response } from "express";
import { Authorize, Controller, Get, Patch, Post } from '../decorators/index.js';
import { inject, singleton } from "tsyringe";
import { UserService } from '../../services/data/user.service.js';
import { Blanket } from '../decorators/blanket.js';
import morgan from "morgan";
import { Collection, RemoveUserOptions } from "mongodb";
import Joi from "joi";
import { Validate } from '../decorators/validate.js';
import { httpContext } from '../middleware/http-context.js';
import { Paginate } from "../decorators/paginate.js";
import { ControllerBase } from "../utils/abstract/controller.abstract.js";
import { User } from "src/data/collections/user.collection.js";
import { EventLog } from "src/data/collections/event.collection.js";
import { Board } from "src/data/collections/board.collection.js";
import { MongoService } from "src/services/data/mongo.service.js";
import { CollectionId } from "src/data/utils/constants/collection-id.js";
import { UserResponse } from "./utils/interfaces/responses/user.response.js";
import { EditProfileRequest } from "./utils/interfaces/requests/edit-profile.request.js";
import { filterNulls } from "src/shared/utils/helpers/filter-nulls.js";
import { BoardResponse } from "./utils/interfaces/responses/board.response.js";


@Controller('/user')
@singleton()
export class UserController extends ControllerBase {
    userCollection: Collection<User>;
    eventLogCollection: Collection<EventLog>;
    boardCollection: Collection<Board>;

    constructor(
        @inject(UserService) private userService: UserService,
        @inject(MongoService) private mongo: MongoService,
    ) {
        super()
        this.userCollection = this.mongo.db.collection<User>(CollectionId.User);
        this.eventLogCollection = this.mongo.db.collection<EventLog>(CollectionId.EventLog);
        this.boardCollection = this.mongo.db.collection<Board>(CollectionId.Board);
    }

    @Get('/')
    @Authorize()
    public async getSelf(req: Request, res: Response) {
        let self = await this.userService.getSelf();
        let userRes = {
            _id: self._id,
            username: self.username,
            pfpPath: self.pfpPath,
            desc: self.desc,
            followers: self.followers,
            usersFollowed: self.usersFollowed,
            boardsFollowed: self.boardsFollowed
        } as UserResponse;

        return res.status(200).send(userRes);
    }

    @Patch('/edit')
    @Authorize()
    @Validate(
        'body', {
            pfpPath: Joi.string(),
            desc: Joi.string()
        }
    )
    public async editSelf(req: Request, res: Response) {
        let input = req.body as EditProfileRequest;
        let selfId = httpContext().userId;
        await this.userCollection.updateOne({
            _id: selfId
        }, {
            $set: filterNulls(input)
        });

        res.status(200).send("Profile edited.")
    }

    @Get('/notifs')
    @Authorize()
    public async getNotifications(req: Request, res: Response) {
        let self = await this.userService.getSelf();
        res.status(200).send(self.notifications);
    }

    @Get('/feed')
    @Authorize()
    @Validate(
        'query', {
            skip: Joi.number(),
            limit: Joi.number()
        }
    )
    @Paginate()
    public async getFeed(req: Request, res: Response) {
        let self = await this.userService.getSelf();
        let pag = httpContext().pagination;
        let logs = await this.eventLogCollection.aggregate([
            // All event logs associated w/ user's following.
            {
                $match: { 
                    $or: [
                        { userId: { $in: self.usersFollowed }},
                        { boardId: { $in: self.boardsFollowed },}
                    ]
                }
            },
            // Sort by descending date
            {
                $sort: { occurred: -1 }
            },
            // Apply pagination.
            {
                $skip: pag.skip,
            },
            {
                $limit: pag.limit
            }
        ]).toArray();
        res.status(200).send(logs);
    }

    @Get('/:username/boards')
    @Validate(
        'params', {
            username: Joi.string().required()
        }
    )   
    public async getUsersBoards(req: Request, res: Response) {
        let { username } = req.params;
        let user = await this.userCollection.findOne({
            username: username
        })
        if (user == null) {
            res.status(409).send("User not found.")
            return;
        }

        let boards = await this.boardCollection.find({
            creatorId: user._id
        }).toArray();
        let boardRes = boards.map(b => {
            return {
                _id: b._id,
                title: b.title,
                desc: b.desc,
                creatorId: b.creatorId,
                tags: b.tags,
                saves: b.saves,
                createdAt: b.createdAt,
                updatedAt: b.updatedAt
            } as BoardResponse
        })
        res.status(200).send(boardRes);
    }

    @Post('/:username/follow')
    @Authorize()
    @Validate(
        'params', {
            username: Joi.string().required()
        }
    )
    public async followUser(req: Request, res: Response) {
        let { username } = req.params;
        let user = await this.userCollection.findOne({
            username: username
        });
        if (user == null) {
            res.status(409).send("User not found.");
            return;
        }
        let self = await this.userService.getSelf();
        if (self._id.equals(user._id)) {
            res.status(405).send("Cannot follow self.");
            return;
        }

        // Update relationships.
        await this.userCollection.updateOne({
            _id: user._id
        }, {
            $push: {
                followers: self._id
            }
        });
        await this.userCollection.updateOne({
            _id: self._id
        }, {
            $push: {
                usersFollowed: user._id
            }
        })
        res.status(200).send("User followed.");
    }

    @Post('/:username/unfollow')
    @Authorize()
    @Validate(
        'params', {
            username: Joi.string().required()
        }
    )
    public async unfollowUser(req: Request, res: Response) {
        let { username } = req.params;
        let user = await this.userCollection.findOne({
            username: username
        });
        if (user == null) {
            res.status(409).send("User not found.");
            return;
        }
        let self = await this.userService.getSelf();
        if (self._id.equals(user._id)) {
            res.status(405).send("Cannot unfollow self.");
            return;
        }

        // Update relationships.
        await this.userCollection.updateOne({
            _id: user._id
        }, {
            $pull: {
                followers: self._id
            }
        });
        await this.userCollection.updateOne({
            _id: self._id
        }, {
            $pull: {
                usersFollowed: user._id
            }
        })
        res.status(200).send("User unfollowed.");
    }

    @Get('/:username')
    @Validate(
        'params', {
            username: Joi.string().required()
        }
    )   
    public async getUser(req: Request, res: Response) {
        let { username } = req.params;
        let user = await this.userCollection.findOne({
            username: username
        })
        if (user == null) {
            res.status(409).send("User not found.")
            return;
        }

        let userRes = {
            _id: user._id,
            username: user.username,
            pfpPath: user.pfpPath,
            desc: user.desc,
            followers: user.followers,
            usersFollowed: user.usersFollowed,
            boardsFollowed: user.boardsFollowed
        } as UserResponse;
        res.status(200).send(userRes);
    }
}