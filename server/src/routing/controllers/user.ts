import { Request, Response } from "express";
import { Authorize, Controller, Get, Post } from "../decorators";
import { inject, singleton } from "tsyringe";
import { ControllerBase } from "../../utils/abstract/controller";
import { UserService } from "../../services/user.service";
import { AuthService } from "../../services";
import { LogService } from "../../services/log.service";
import { Blanket } from "../decorators/blanket";
import morgan from "morgan";
import { RemoveUserOptions } from "mongodb";
import { ContextService } from "../../services/context.service";
import { Board, BoardEvent, Tag, User } from "../../data/models";
import { UserEvent } from "../../data/models/activity/user-event";
import { usePagination } from "../../utils/extensions/use-pagination";
import { Notification } from "../../data/models";
import Joi from "joi";
import { Validate } from "../decorators/validate";


@Controller('/user')
@Blanket([
    morgan('common')
])
@singleton()
export class UserController extends ControllerBase {
    constructor(
        @inject(UserService) private userService: UserService,
        @inject(LogService) private logService: LogService
    ) {
        super()
    }

    @Get('/:username')
    @Validate(
        'params', {
            username: Joi.string().required()
        }
    )   
    public getUser(req: Request, res: Response) {
        try {
            let { username } = req.params;
            let user = this.userService.getUserByName(username);
            if (user == null) {
                res.status(409).send("User not found.")
                return;
            }

            res.status(200).send(user);
        } catch (error: any) {
            this.logService.error(error);
            res.status(500).send();
        }
    }

    @Get('/:username/boards')
    @Validate(
        'params', {
            username: Joi.string().required()
        }
    )   
    public async getBoards(req: Request, res: Response) {
        try {
            let { username } = req.params;
            let user = await this.userService.getUserByName(username);
            if (user == null) {
                res.status(409).send("User not found.")
                return;
            }

            let boards = Board
                .find({
                    creatorId: user.id
                });
            res.status(200).send(boards);
        } catch (error: any) {
            this.logService.error(error);
            res.status(500).send();
        }
    }

    @Post('/:username/follow')
    @Authorize()
    @Validate(
        'params', {
            username: Joi.string().required()
        }
    )
    public async followUser(req: Request, res: Response) {
        try {
            let { username } = req.params;
            let user = await this.userService.getUserByName(username);
            if (user == null) {
                res.status(409).send("User not found.");
                return;
            }
            let self = await this.userService.getSelf();
            if (self.id == user.id) {
                res.status(405).send("Cannot follow self.");
                return;
            }

            // Update relationships.
            self.usersFollowed.push(user.id);
            self.save();
            user.followers.push(self.id);
            user.save();

            res.status(200).send("User followed.");
        } catch (error: any) {
            this.logService.error(error);
            res.status(500).send();
        }
    }

    @Post('/:username/unfollow')
    @Authorize()
    @Validate(
        'params', {
            username: Joi.string().required()
        }
    )
    public async unfollowUser(req: Request, res: Response) {
        try {
            let { username } = req.params;
            let user = await this.userService.getUserByName(username);
            if (user == null) {
                res.status(409).send("User not found.");
                return;
            }
            let self = await this.userService.getSelf();
            if (self.id == user.id) {
                res.status(405).send("Cannot follow self.");
                return;
            }

            // Update relationships.
            User.findOneAndUpdate(
                { _id: self.id },
                { 
                    $pull:  {
                        usersFollowed: user.id
                    }
                }
            );
            User.findOneAndUpdate(
                { _id: user.id },
                { 
                    $pull:  {
                        following: self.id
                    }
                }
            );

            res.status(200).send("User unfollowed.");
        } catch (error: any) {
            this.logService.error(error);
            res.status(500).send();
        }
    }


    @Get('/')
    @Authorize()
    public getSelf(req: Request, res: Response) {
        try {
            return res.status(200).send(this.userService.getSelf()!);
        } catch (error: any) {
            this.logService.error(error);
            res.status(500).send();
        }
    }

    @Get('/notifs')
    @Authorize()
    public async getNotications(req: Request, res: Response) {
        try {
            let self = await this.userService.getSelf();
            let notifs = Notification
                .find({
                    userId: self.id
                })
                .sort({ occurred: 'desc' })
                .exec();
            res.status(200).send(notifs);
        } catch (error: any) {
            this.logService.error(error);
            res.status(500).send();
        }
    }

    @Get('/feed')
    @Authorize()
    public async getFeed(req: Request, res: Response) {
        try {
            let self = await this.userService.getSelf();
            let pag = usePagination(req);

            let events = await BoardEvent.aggregate([
                {
                    $match: { 
                        $in: [ 
                            'boardId', self.boardsFollowed
                        ] 
                    }
                },
                {
                    $unionWith: {
                        coll: 'UserEvent',
                        pipeline: [
                            {
                                $match: { 
                                    $in: [ 
                                        'userId', self.usersFollowed
                                    ] 
                                }
                            }
                        ]
                    }
                },
                {
                    $sort: { occurred: -1 }
                },
                {
                    $skip: pag.skip,
                },
                {
                    $limit: pag.limit
                }
            ]).exec();

            res.status(200).send(events);
        } catch (error: any) {
            this.logService.error(error);
            res.status(500).send();
        }
    }
}