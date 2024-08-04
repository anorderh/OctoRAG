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


@injectable()
export class UserService {

    constructor(
        @inject(MongoService) private mongo: MongoService
    ) {}

    public async getSelf() {
        let userCollection = this.mongo.db.collection<User>(CollectionId.User);
        let currId = httpContext().userId;
        if (currId == null) {
            throw new Error("Can't get user if request is not authenticated.")
        }
        
        let self = await userCollection.findOne({
                _id: currId
            })
        if (self == null) {
            throw new Error("Can't find current user.");
        }

        return self;         
    }
}