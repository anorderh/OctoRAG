import { Request, Response } from 'express';
import { Collection } from 'mongodb';
import { User } from 'src/database/entities/user/user.js';
import { CollectionId } from 'src/database/shared/constants/collection-id.js';
import { MongoService } from 'src/services/mongo.service.js';
import { UserService } from 'src/services/user.service.js';
import { inject, singleton } from 'tsyringe';
import { Authorize } from './decorators/authorize.js';
import { Get } from './decorators/http.js';
import { Controller } from './decorators/index.js';
import { ControllerBase } from './shared/abstract/controller.abstract.js';
import { ControllerResponse } from './shared/interfaces/controller-response.js';
import { UserResponse } from './shared/validation/responses/user.res.js';

@Controller('/user')
@singleton()
export class UserController extends ControllerBase {
    userCollection: Collection<User>;

    constructor(
        @inject(UserService) private userService: UserService,
        @inject(MongoService) private mongo: MongoService,
    ) {
        super();
        this.userCollection = this.mongo.db.collection<User>(CollectionId.User);
    }

    @Get('/')
    @Authorize()
    public async getSelf(req: Request, res: Response) {
        let self = await this.userService.getSelf();
        let userRes = {
            _id: self._id,
            username: self.username,
        } as UserResponse;

        return res.status(200).send({
            message: 'User fetched',
            data: {
                userRes,
            },
        } satisfies ControllerResponse);
    }
}
