import { ObjectId } from "mongodb";
import { VersionResponse } from './version.response.js';

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