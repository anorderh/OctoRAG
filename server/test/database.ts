import { User } from 'src/database/collections/user.collection';
import { CollectionId } from 'src/database/shared/constants/collection-id';
import { MongoService } from 'src/services/mongo.service.js';
import { container } from 'tsyringe';

export class Database {
    public static async deleteUser(username: string) {
        let mongo = container.resolve(MongoService);
        await mongo.db.collection<User>(CollectionId.User).deleteOne({
            username: username,
        });
    }
}
