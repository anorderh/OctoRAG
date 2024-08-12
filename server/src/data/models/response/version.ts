import { ObjectId } from "mongodb";
import { FindResponse } from "./find";

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