import { ObjectId } from "mongodb";

export interface BoardResponse {
    _id: ObjectId;
    title: string;
    desc: string;
    creatorId: ObjectId;
    tags: string[];
    views: number;
    clicks: number;
    saves: number;
    createdAt: Date;
    updatedAt: Date;
}