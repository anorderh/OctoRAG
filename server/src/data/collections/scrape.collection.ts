import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { CollectionSetup } from "../utils/types/collection-setup";
import { CollectionId } from "../utils/constants/collection-id";

export interface Scrape {
    _id: ObjectId;
    _libraryId: ObjectId;
    embeddingModel: string;
    embeddingModelDimensionality: string;
    created: Date
}

export const createScrapeCollection : CollectionSetup = async (db: Db) => {
    await db.createCollection(CollectionId.Scrape, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Scrape Validation",
                required: ["_id", "_libraryId", "embeddingModel", "embeddingModelDimensionality", "created"],
                properties: {
                    _id: {bsonType: "objectId"},
                    _libraryId: {bsonType: "objectId"},
                    embeddingModel: {bsonType: "string"},
                    embeddingModelDimensionality: {bsonType: "string"},
                    created: {bsonType: "date"},
                }
            }
        }
    } as CreateCollectionOptions)
}