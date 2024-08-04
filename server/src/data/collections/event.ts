import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { Event } from "../../utils/enums/event";
import { EventGroup } from "../../utils/enums/event-group";
import { CollectionId } from "../../utils/enums/collection-id";

export interface EventLog {
    _id: ObjectId;
    event: Event;
    group: EventGroup;
    content: string;
    occurred: Date;
}

export interface BoardEventLog extends EventLog { 
    boardId: ObjectId;
}

export interface UserEventLog extends EventLog {
    userId: ObjectId;
}

export const createEventLogCollection = (db: Db) => {
    db.createCollection(CollectionId.EventLog, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Event Validation",
                oneOf: [
                    {
                        type: "object",
                        required: ["_id", "event", "group", "content", "occurred", "boardId"],
                        properties: {
                            _id: {bsonType: "objectId"},
                            event: {enum: Object.keys(Event)},
                            group: {enum: Object.keys(EventGroup)},
                            content: {bsonType: "string"},
                            occurred: { bsonType: "date"},
                            boardId: {bsonType: "objectId"}
                        }
                    },
                    {
                        type: "object",
                        required: ["_id", "event", "group", "content", "occurred", "userId"],
                        properties: {
                            _id: {bsonType: "objectId"},
                            event: {enum: Object.keys(Event)},
                            group: {enum: Object.keys(EventGroup)},
                            content: {bsonType: "string"},
                            occurred: { bsonType: "date"},
                            userId: {bsonType: "objectId"}
                        }
                    },
                ]
            }
        }
    } as CreateCollectionOptions)
}