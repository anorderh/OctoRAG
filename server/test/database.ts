import { container } from "tsyringe";
import { User } from "src/data/collections/user.collection.js";
import { MongoService } from "src/services/data/mongo.service.js";
import { CollectionId } from "src/data/utils/constants/collection-id.js";


export class Database {
    public static async deleteUser(username: string) {
        let mongo = container.resolve(MongoService);
        await mongo.db.collection<User>(CollectionId.User).deleteOne({
            username: username
        })
    }
}