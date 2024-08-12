import { ObjectId } from "mongodb";
import { VersionResponse } from "./version";

export interface BoardResponse {
    _id: ObjectId;
    title: string;
    desc: string;
    creatorId: ObjectId;
    versions: VersionResponse[];
    tags: string[];
    saves: number;
    createdAt: Date;
    updatedAt: Date;
}

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