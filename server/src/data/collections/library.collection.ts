import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { CollectionSetup } from "../utils/types/collection-setup";
import { CollectionId } from "../utils/constants/collection-id";

export interface Library {
    _id: ObjectId;
    name: string;
    _userId: ObjectId;
    created: Date;
    pendingScrape: boolean;
    lastScraped: Date;
}

export const createLibraryCollection : CollectionSetup<Library> = async (db: Db) => {
    return await db.createCollection(CollectionId.Library, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Library Validation",
                required: ["_id", "name", "created"],
                properties: {
                    _id: {bsonType: "objectId"},
                    name: { bsonType: "string" },
                    _userId: {bsonType: "objectId"},
                    created: {bsonType: "date"},
                    pendingScrape: {bsonType: "bool"},
                    lastScraped: {bsonType: "date"}
                }
            }
        }
    } as CreateCollectionOptions)
}