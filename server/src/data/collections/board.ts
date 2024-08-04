import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { CollectionId } from "../../utils/enums/collection-id";
import { FindType } from "../../utils/enums/find-type";

export interface Board {
    _id: ObjectId;
    title: string;
    desc: string;
    creatorId: ObjectId;
    followers: ObjectId[];
    finds: Find[];
    tags: string[];
    views: number;
    clicks: number;
    saves: number;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

export interface Find {
    _id: ObjectId;
    title: string;
    desc: string;
    link: string;
    type: FindType;
    relations: Relation[];
    grouping: string[];
    level: number;
    views: number;
    clicks: number;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

export interface Relation {
    _id: ObjectId;
    destFind: ObjectId;
    label: string;
    desc: string;
}

export const createBoardCollection = (db: Db) => {
    db.createCollection(CollectionId.User, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Board Validation",
                required: ["_id", "title", "creatorId", "active"],
                properties: {
                    _id: {bsonType: "objectId"},
                    title: {bsonType: "string"},
                    desc: {bsonType: "string"},
                    creatorId: {bsonType: "objectId"},
                    followers: {
                        bsonType: "array", 
                        items: {
                            bsonType: "objectId"
                        }
                    },
                    finds: {
                        bsonType: "array",
                        items: {
                            bsonType: "object",
                            required: ["_id", "title", "link", "type", "level", "active"],
                            properties: {
                                _id: {bsonType: "objectId"},
                                title: {bsonType: "string"},
                                desc: {bsonType: "string"},
                                link: {bsonType: "string"},
                                type: {enum: Object.keys(FindType)},
                                relations: {
                                    bsonType: "array",
                                    items: {
                                        bsonType: "object",
                                        required: ["_id", "destFind", "label"],
                                        properties: {
                                            _id: {bsonType: "objectId"},
                                            destFind: {bsonType: "objectId"},
                                            label: {bsonType: "string"},
                                            desc: {bsonType: "string"}
                                        }
                                    }
                                },
                                grouping: {
                                    bsonType: "array",
                                    items: {bsonType: "string"}
                                },
                                level: {bsonType: "number"},
                                views: {bsontype: "number"},
                                clicks: {bsontype: "number"},
                                createdAt: {bsonType: "date"},
                                updatedAt: {bsonType: "date"},
                                active: {bsonType: "bool"}
                            },
                            additionalProperties: false
                        }
                    },
                    tags: {
                        bsonType: "array",
                        items: {
                            bsonType: "string",
                        }
                    },
                    views: {bsonType: "number"},
                    clicks: {bsonType: "number"},
                    saves: {bsonType: "number"},
                    createdAt: {bsonType: "date"},
                    updatedAt: {bsonType: "date"},
                    active: {bsonType: "bool"}
                },
                additionalProperties: false
            }
        }
    } as CreateCollectionOptions)
}