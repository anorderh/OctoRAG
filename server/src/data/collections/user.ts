import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { CollectionId } from "../../utils/enums/collection-id";
import { CollectionSetup } from "../../utils/types/collection-setup";

export interface User {
    _id: ObjectId;
    username: string;
    credentials: Credentials;
    pfpPath: string;
    desc: string;
    followers: ObjectId[];
    usersFollowed: ObjectId[];
    boardsFollowed: ObjectId[];
    notifications: Notification[]
}

export interface Credentials {
    email: string;
    password: string;
}

export interface Notification{
    _id: ObjectId;
    eventId: ObjectId;
    msg: string,
    occurred: Date,
    acknowledged: boolean,
    link: string
}

export const createUserCollection : CollectionSetup = (db: Db) => {
    db.createCollection(CollectionId.User, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "User Validation",
                required: ["_id", "username", "credentials"],
                properties: {
                    _id: {bsonType: "objectId"},
                    username: { bsonType: "string" },
                    credentials: { 
                        bsonType: "object",
                        required: ["email", "password"],
                        properties: {
                            email: { bsonType: "string" },
                            password: { bsonType: "string" }
                        }
                    },
                    pfpPath: {bsonType: "string"},
                    desc: {bsonType: "string"},
                    followers: {
                        bsonType: "array",
                        items: {bsonType: "objectId"}
                    },
                    boardsFollowed: {
                        bsonType: "array",
                        items: {bsonType: "objectId"}
                    },
                    usersFollowed: {
                        bsonType: "array",
                        items: {bsonType: "objectId"}
                    },
                    notifications: {
                        bsonType: "array",
                        items: {
                            bsonType: "object",
                            required: ["_id", "eventType", "eventId", "msg", "occurred"],
                            properties: {
                                _id: {bsonType: "objectId"},
                                eventId: {bsonType: "objectId"},
                                msg: {bsonType: "string"},
                                occurred: {bsonType: "date"},
                                acknowledged: {bsonType: "bool"},
                                link: {bsonType: "string"}
                            }
                        }
                    }
                }
            }
        }
    } as CreateCollectionOptions)
}