import { Collection } from 'mongodb';
import { User } from 'src/database/entities/user/user.js';
import { CollectionId } from 'src/database/shared/constants/collection-id.js';
import { MongoService } from 'src/services/mongo.service.js';
import { UserService } from 'src/services/user.service.js';
import { inject, singleton } from 'tsyringe';
import { Authorize } from './decorators/authorize.js';
import { Get } from './decorators/http.js';
import { Controller } from './decorators/index.js';
import { UserGetSelfRequest, UserGetSelfResponse } from './dto/user.js';
import { ControllerBase } from './shared/abstract/controller.abstract.js';
import { UserReadModel } from './shared/interfaces/user.models.js';

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
    public async getSelf(req: UserGetSelfRequest, res: UserGetSelfResponse) {
        let self = await this.userService.getSelf();
        let userRes: UserReadModel = {
            _id: self._id,
            username: self.username,
            email: self.email,
        };

        return res.status(200).send({
            message: 'User fetched',
            data: {
                user: userRes,
            },
        });
    }
}
