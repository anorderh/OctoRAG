import { ObjectId, Schema, Types, model } from "mongoose";
import { FindType } from "../../../utils/enums/find-type";

export interface Find {
    id: ObjectId;
    title: string;
    creatorId: ObjectId;
    boardId: ObjectId;
    link: string;
    desc: string;
    grouping: string[];
    findType: FindType;
    rank: number;
    views: number;
    clicks: number;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

export const Find = model<Find>(
    'Find', 
    new Schema({
        title: { type: String, required: true},
        creatorId: { type: Types.ObjectId, ref: 'User', required: true },
        boardId: { type: Types.ObjectId, ref: 'Board', required: true },
        link: {type: String, required: true},
        desc: {type: String},
        grouping: [{type: String}],
        findType: { type: String, enum: Object.values(FindType), required: true },
        rank: { type: Number, required: true },
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        active: { type: Boolean, default: true }
    }, {
        timestamps: true
    })
);