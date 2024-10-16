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
import { MongoService } from "src/services/data/mongo.service.js";
import { CollectionId } from "src/data/utils/constants/collection-id.js";
import { UserResponse } from "./utils/interfaces/responses/user.response.js";
import { EditProfileRequest } from "./utils/interfaces/requests/edit-profile.request.js";
import { filterNulls } from "src/shared/utils/helpers/filter-nulls.js";


@Controller('/user')
@singleton()
export class UserController extends ControllerBase {
    userCollection: Collection<User>;

    constructor(
        @inject(UserService) private userService: UserService,
        @inject(MongoService) private mongo: MongoService,
    ) {
        super()
        this.userCollection = this.mongo.db.collection<User>(CollectionId.User);
    }

    @Get('/')
    @Authorize()
    public async getSelf(req: Request, res: Response) {
        let self = await this.userService.getSelf();
        let userRes = {
            _id: self._id,
            username: self.username,
            pfpPath: self.pfpPath,
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
        } as UserResponse;
        res.status(200).send(userRes);
    }
}