import { Collection } from 'mongodb';
import { User } from 'src/data/collections/user.collection.js';
import { CollectionId } from 'src/data/utils/constants/collection-id.js';
import { inject, injectable } from 'tsyringe';
import { httpContext } from '../controllers/middleware/http-context.js';
import { InvalidUserError } from '../shared/classes/errors.js';
import { MongoService } from './mongo.service.js';
import { Service } from './shared/abstract/service.abstract.js';

@injectable()
export class UserService extends Service {
    userCollection: Collection<User>;

    constructor(@inject(MongoService) private mongo: MongoService) {
        super();
        this.userCollection = this.mongo.db.collection<User>(CollectionId.User);
    }

    public async getSelf() {
        let currId = httpContext().userId;
        if (currId == null) {
            throw new InvalidUserError({
                status: 401,
                body: "Can't get current user for authenticated requests.",
            });
        }

        let self = await this.userCollection.findOne({
            _id: currId,
        });
        if (self == null) {
            throw new InvalidUserError({
                body: "Can't find current user.",
            });
        }
        return self;
    }
}
