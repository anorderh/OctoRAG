import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { inject, injectable, Lifecycle, scoped } from "tsyringe";
import { httpContext } from '../../routing/middleware/http-context.js';
import { MongoService } from './mongo.service.js';
import { InvalidUserError } from '../../error-handling/errors.js';
import { Collection } from 'mongodb';
import { Service } from '../utils/abstract/service.abstract.js';
import { User } from 'src/data/collections/user.collection.js';
import { CollectionId } from 'src/data/utils/constants/collection-id.js';
import { DependencyInjectionToken } from 'src/dependencies/utils/constants/dependency-injection-token.js';
import { instantiate } from 'src/dependencies/utils/extensions/instantiate.js';

@injectable()
export class UserService extends Service {
    userCollection: Collection<User>;
    
    constructor(
        @inject(MongoService) private mongo: MongoService
    ) {
        super();
        this.userCollection = this.mongo.db.collection<User>(CollectionId.User);
    }

    public async getSelf() {
        let currId = httpContext().userId;
        if (currId == null) {
            throw new InvalidUserError({
                status: 401,
                body: "Can't get current user for authenticated requests."
            })
        }
        
        let self = await this.userCollection.findOne({
                _id: currId
            })
        if (self == null) {
            throw new InvalidUserError({
                body: "Can't find current user."
            })
        }
        return self;         
    }
}