import { User } from 'src/data/collections/user.collection.js';
import { CollectionId } from 'src/data/utils/constants/collection-id.js';
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
