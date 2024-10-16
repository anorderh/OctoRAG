import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { CollectionSetup } from "../utils/types/collection-setup";
import { CollectionId } from "../utils/constants/collection-id";
import { ChatType } from "../utils/constants/chat-type";

export interface Chat {
    _id: ObjectId;
    _sessionId: ObjectId;
    type: ChatType;
    content: string;
    created: Date
}

export const createChatCollection : CollectionSetup = async (db: Db) => {
    await db.createCollection(CollectionId.Chat, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Chat Validation",
                required: [
                    "_id",
                    "_sessionId",
                    "type",
                    "content",
                    "created"
                ],
                properties: {
                    _id: {bsonType: "objectId"},
                    _sessionId: {bsonType: "objectId"},
                    type: {bsonType: "string", enum: Object.values(ChatType)},
                    content: {bsonType: "string"},
                    created: {bsonType: "date"},
                }
            }
        }
    } as CreateCollectionOptions)
}