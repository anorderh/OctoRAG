import { ObjectId } from "mongodb";
import { Relation } from "src/data/collections/board.collection";
import { FindType } from "src/data/utils/constants/find-type";

export interface FindResponse {
    _id: ObjectId;
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
}
