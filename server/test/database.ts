import { container } from "tsyringe";
import { createUserCollection, User } from "../src/data/collections"
import { MongoService } from "../src/services"
import { CollectionId } from "../src/utils/enums/collection-id";


export class Database {
    public static async deleteUser(username: string) {
        let mongo = container.resolve(MongoService);
        await mongo.db.collection<User>(CollectionId.User).deleteOne({
            username: username
        })
    }
}