import { Schema, Types, model } from "mongoose";
import { FindTypeId } from "../../../utils/enums/find-type-id";
import { FindPosition } from "../../../utils/types/find-position";

export interface Find {
    id: string;
    title: string;
    creatorId: string;
    findTypeId: FindTypeId;
    boardId: string;
    position: FindPosition;
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
        creatorId: { type: String, ref: 'User', required: true },
        boardId: { type: String, ref: 'Board', required: true },
        findTypeId: { type: String, enum: Object.values(FindTypeId), required: true },
        position: { type: Schema.Types.Mixed, required: true },
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        active: { type: Boolean, default: true }
    }, {
        timestamps: true
    })
);