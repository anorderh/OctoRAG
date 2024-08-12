import { Request, Response } from "express";
import { Authorize, Controller, Get, Post } from "../decorators";
import { inject, singleton } from "tsyringe";
import { ControllerBase } from "../../utils/abstract/controller";
import { UserService } from "../../services/user.service";
import { AuthService, MongoService } from "../../services";
import { Blanket } from "../decorators/blanket";
import morgan from "morgan";
import { Collection, RemoveUserOptions } from "mongodb";
import { usePagination } from "../../utils/extensions/use-pagination";
import Joi from "joi";
import { Validate } from "../decorators/validate";
import { Board, EventLog, User } from "../../data/collections";
import { CollectionId } from "../../utils/enums/collection-id";
import { UserResponse } from "../../data/models/response/user";
import { BoardResponse } from "../../data/models/response/board";
import { httpContext } from "../middleware/http-context";
import { EditProfileRequest } from "../../data/models/request/edit-profile";
import { filterNulls } from "../../utils/extensions/filter-nulls";


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

    @Post('/edit')
    @Authorize()
    @Validate(
        'body', {
            pfpPath: Joi.string(),
            desc: Joi.string()
        }
    )
    public async editSelf(req: Request, res: Response) {
        let input = req.body as EditProfileRequest;
        let self = httpContext().userId;
        await this.userCollection.updateOne({
            _id: self.id
        }, filterNulls(input));

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
    public async getFeed(req: Request, res: Response) {
        let self = await this.userService.getSelf();
        let pag = usePagination(req);
        let logs = await this.eventLogCollection.aggregate([
            // All event logs associated w/ user's following.
            [
                {
                    $match: { 
                        $or: [
                            { userId: { $in: self.usersFollowed }},
                            { boardId: { $in: self.boardsFollowed },}
                        ]
                    }
                }
            ],
            // Sort by descending date
            {
                $sort: { occurred: -1 }
            },
            // Appyl pagination.
            {
                $skip: pag.skip,
            },
            {
                $limit: pag.limit
            }
        ]);
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
        if (self._id == user._id) {
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
        if (self._id == user._id) {
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