import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { CollectionId } from "../utils/constants/collection-id.js";
import { EventType } from "../utils/constants/event-type.js";
import { CollectionSetup } from "../utils/types/collection-setup.js";
import { BoardEvent, UserEvent } from "../utils/constants/event.js";

export interface EventLog {
    _id: ObjectId;
    type: EventType,
    event: string;
    occurred: Date;
    ref?: any;
}

export interface BoardEventLog extends EventLog { 
    boardId: ObjectId;
}

export interface UserEventLog extends EventLog {
    userId: ObjectId;
}

export const createEventLogCollection : CollectionSetup = async (db: Db) => {
    await db.createCollection(CollectionId.EventLog, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Event Validation",
                oneOf: [
                    {
                        type: "object",
                        required: ["_id", "type", "event", "occurred", "boardId"],
                        properties: {
                            _id: {bsonType: "objectId"},
                            type: {bsonType: "number", enum: Object.values(EventType)},
                            event: {bsonType: "string", enum: Object.values(BoardEvent)},
                            occurred: { bsonType: "date"},
                            boardId: {bsonType: "objectId"},
                            ref: {bsonType: ["object", "string", "objectId", "null"]}
                        }
                    },
                    {
                        type: "object",
                        required: ["_id", "type", "event", "occurred", "userId"],
                        properties: {
                            _id: {bsonType: "objectId"},
                            type: {bsonType: "number", enum: Object.values(EventType)},
                            event: {bsonType: "string", enum: Object.values(UserEvent)},
                            occurred: { bsonType: "date"},
                            userId: {bsonType: "objectId"},
                            ref: {bsonType: ["object", "string", "objectId", "null"]}
                        }
                    },
                ]
            }
        }
    } as CreateCollectionOptions)
}