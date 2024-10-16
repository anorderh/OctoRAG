import { ObjectId } from "mongodb";
import { FindResponse } from './find.response.js';

export interface VersionResponse {
    _id: ObjectId;
    index: number;
    desc: string;
    finds: FindResponse[];
    visits: number;
    createdAt: Date;
    updatedAt: Date;
    published: boolean;
}