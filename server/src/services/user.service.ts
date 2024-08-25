import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { inject, injectable, Lifecycle, scoped } from "tsyringe";
import { env } from '../env';
import { Token } from '../utils/interfaces/token';
import { TokenType } from '../utils/enums/token-type';
import { httpContext } from '../routing/middleware/http-context';
import { MongoService } from './mongo.service';
import { CollectionId } from '../utils/enums/collection-id';
import { User } from '../data/collections';
import { InvalidUserError } from '../error-handling/errors';


@injectable()
export class UserService {

    constructor(
        @inject(MongoService) private mongo: MongoService
    ) {}

    public async getSelf() {
        let userCollection = this.mongo.db.collection<User>(CollectionId.User);
        let currId = httpContext().userId;
        if (currId == null) {
            throw new InvalidUserError({
                status: 401,
                body: "Can't get current user for authenticated requests."
            })
        }
        
        let self = await userCollection.findOne({
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