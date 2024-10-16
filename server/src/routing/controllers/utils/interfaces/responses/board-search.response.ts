import { ObjectId } from "mongodb";

export interface BoardSearchResponse {
    _id: ObjectId;
    title: string;
    desc: string;
    creatorId: ObjectId;
    tags: string[];
    saves: number;
    createdAt: Date;
    updatedAt: Date;
}