import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { CollectionSetup } from "../utils/types/collection-setup";
import { CollectionId } from "../utils/constants/collection-id";
import { ResourceType } from "../utils/constants/resource-type";

export interface Resource {
    _id: ObjectId;
    path: string;
    type: ResourceType;
    _libraryId: ObjectId;
    created: Date;
}

export const createResourceCollection : CollectionSetup<Resource> = async (db: Db) => {
    return await db.createCollection(CollectionId.Resource, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Resource Validation",
                required: ["_id", "path", "type", "_libraryId", "created"],
                properties: {
                    _id: {bsonType: "objectId"},
                    path: { bsonType: "string" },
                    type: {bsonType: "string", enum: Object.values(ResourceType) },
                    _libraryId: {bsonType: "objectId"},
                    created: {bsonType: "date"}
                }
            }
        }
    } as CreateCollectionOptions)
}