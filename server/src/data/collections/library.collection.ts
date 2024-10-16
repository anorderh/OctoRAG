import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { CollectionSetup } from "../utils/types/collection-setup";
import { CollectionId } from "../utils/constants/collection-id";

export interface Library {
    _id: ObjectId;
    name: string;
    _userId: ObjectId;
    created: Date;
    lastScraped: Date;
}

export const createLibraryCollection : CollectionSetup = async (db: Db) => {
    await db.createCollection(CollectionId.Library, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Library Validation",
                required: ["_id", "name", "_userId", "created"],
                properties: {
                    _id: {bsonType: "objectId"},
                    name: { bsonType: "string" },
                    _userId: {bsonType: "objectId"},
                    created: {bsonType: "date"},
                    lastScraped: {bsonType: "date"}
                }
            }
        }
    } as CreateCollectionOptions)
}