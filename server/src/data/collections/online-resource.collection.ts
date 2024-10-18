import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { CollectionSetup } from "../utils/types/collection-setup";
import { CollectionId } from "../utils/constants/collection-id";
import { OnlineResourceType } from "../utils/constants/online-resource-type";

export interface OnlineResource {
    _id: ObjectId;
    url: string;
    type: OnlineResourceType;
    _libraryId: ObjectId;
    created: Date;
}

export const createOnlineResourceCollection : CollectionSetup<OnlineResource> = async (db: Db) => {
    return await db.createCollection(CollectionId.OnlineResource, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Online Resource Validation",
                required: ["_id", "url", "type", "_libraryId", "created"],
                properties: {
                    _id: {bsonType: "objectId"},
                    url: { bsonType: "string" },
                    type: {bsonType: "string", enum: Object.values(OnlineResourceType) },
                    _libraryId: {bsonType: "objectId"},
                    created: {bsonType: "date"}
                }
            }
        }
    } as CreateCollectionOptions)
}