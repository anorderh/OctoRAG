import { CreateCollectionOptions, Db, ObjectId } from "mongodb";
import { CollectionId } from '../../utils/enums/collection-id';
import { FindType } from '../../utils/enums/find-type';
import { CollectionSetup } from '../../utils/types/collection-setup';

export interface Board {
    _id: ObjectId;
    title: string;
    desc: string;
    creatorId: ObjectId;
    followers: ObjectId[];
    versions: Version[];
    tags: string[];
    saves: number;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
    public: boolean;
}

export interface Version {
    _id: ObjectId;
    index: number;
    desc: string;
    finds: Find[];
    visits: number;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
    published: boolean
}

export interface Find {
    _id: ObjectId;
    index: number;
    title: string;
    desc: string;
    link: string;
    type: FindType;
    relations: Relation[];
    grouping: string[];
    rank: number;
    views: number;
    clicks: number;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

export interface Relation {
    destIdx: number;
    label: string;
    desc: string;
}

export const createBoardCollection : CollectionSetup = (db: Db) => {
    db.createCollection(CollectionId.Board, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Board Validation",
                required: ["_id", "title", "creatorId", "active", "public"],
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
                    versions: {
                        bsonType: "array",
                        items: {
                            bsonType: "object",
                            required: ["_id", "index", "finds", "active"],
                            properties: {
                                _id: { bsonType: "objectId" },
                                index: { bsonType: "number" },
                                desc: { bsonType: "string" },
                                finds: {
                                    bsonType: "array",
                                    items: {
                                        bsonType: "object",
                                        required: ["_id", "index", "title", "link", "type", "rank", "active"],
                                        properties: {
                                            _id: {bsonType: "objectId"},
                                            index: {bsonType: "number"},
                                            title: {bsonType: "string"},
                                            desc: {bsonType: "string"},
                                            link: {bsonType: "string"},
                                            type: {enum: Object.keys(FindType)},
                                            relations: {
                                                bsonType: "array",
                                                items: {
                                                    bsonType: "object",
                                                    required: ["destIdx", "label"],
                                                    properties: {
                                                        destIdx: {bsonType: "number"},
                                                        label: {bsonType: "string"},
                                                        desc: {bsonType: "string"}
                                                    }
                                                }
                                            },
                                            grouping: {
                                                bsonType: "array",
                                                items: {bsonType: "string"}
                                            },
                                            rank: {bsonType: "number"},
                                            views: {bsonType: "number"},
                                            clicks: {bsonType: "number"},
                                            createdAt: {bsonType: "date"},
                                            updatedAt: {bsonType: "date"},
                                            active: {bsonType: "bool"}
                                        },
                                        additionalProperties: false
                                    }
                                },
                                visits: {bsonType: "number"},
                                createdAt: {bsonType: "date"},
                                updatedAt: {bsonType: "date"},
                                active: {bsonType: "bool"},
                                published: {bsonType: "bool"}
                            }
                        }
                    },
                    tags: {
                        bsonType: "array",
                        items: {
                            bsonType: "string",
                        }
                    },
                    saves: {bsonType: "number"},
                    createdAt: {bsonType: "date"},
                    updatedAt: {bsonType: "date"},
                    active: {bsonType: "bool"},
                    public: {bsonType: "bool"}
                },
                additionalProperties: false
            }
        }
    } as CreateCollectionOptions)
}