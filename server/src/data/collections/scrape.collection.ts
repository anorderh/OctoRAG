import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { CollectionSetup } from "../utils/types/collection-setup";
import { CollectionId } from "../utils/constants/collection-id";

export interface Scrape {
    _id: ObjectId;
    _libraryId: ObjectId;
    embeddingModel: string;
    created: Date
}

export const createScrapeCollection : CollectionSetup<Scrape> = async (db: Db) => {
    return await db.createCollection(CollectionId.Scrape, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Scrape Validation",
                required: ["_id", "_libraryId", "embeddingModel", "created"],
                properties: {
                    _id: {bsonType: "objectId"},
                    _libraryId: {bsonType: "objectId"},
                    embeddingModel: {bsonType: "string"},
                    created: {bsonType: "date"},
                }
            }
        }
    } as CreateCollectionOptions)
}