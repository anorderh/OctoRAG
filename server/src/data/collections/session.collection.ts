import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { CollectionSetup } from "../utils/types/collection-setup";
import { CollectionId } from "../utils/constants/collection-id";

export interface Session {
    _id: ObjectId;
    namespace: string;
    llmModel: string;
    _userId: ObjectId;
    _libraryId: ObjectId;
    _scrapeId: ObjectId;
    created: Date
}

export const createSessionCollection : CollectionSetup<Session> = async (db: Db) => {
    return await db.createCollection(CollectionId.Session, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Session Validation",
                required: [
                    "_id",
                    "namespace",
                    "llmModel",
                    "_libraryId",
                    "_scrapeId",
                    "created"
                ],
                properties: {
                    _id: {bsonType: "objectId"},
                    namespace: {bsonType: "string"},
                    llmModel: {bsonType: "string"},
                    _userId: {bsonType: "objectId"},
                    _libraryId: {bsonType: "objectId"},
                    _scrapeId: {bsonType: "objectId"},
                    created: {bsonType: "date"},
                }
            }
        }
    } as CreateCollectionOptions)
}