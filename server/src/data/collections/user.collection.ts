import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { Credentials } from "../utils/constants/credentials";
import { CollectionSetup } from "../utils/types/collection-setup";
import { CollectionId } from "../utils/constants/collection-id";

export interface User {
    _id: ObjectId;
    username: string;
    credentials: Credentials;
    pfpPath: string;
    desc: string;
}

export const createUserCollection : CollectionSetup<User> = async (db: Db) => {
    return await db.createCollection(CollectionId.User, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "User Validation",
                required: ["_id", "username", "credentials"],
                properties: {
                    _id: {bsonType: "objectId"},
                    username: { bsonType: "string" },
                    credentials: { 
                        bsonType: "object",
                        required: ["email", "password"],
                        properties: {
                            email: { bsonType: "string" },
                            password: { bsonType: "string" }
                        }
                    },
                    pfpPath: {bsonType: "string"},
                    desc: {bsonType: "string"},
                }
            }
        }
    } as CreateCollectionOptions)
}