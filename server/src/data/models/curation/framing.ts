import { Schema, Types, model } from "mongoose";
import { FindTypeId } from "../../../utils/enums/find-type-id";
import { FindPosition } from "../../../utils/types/find-position";
import { FramingTypeId } from "../../../utils/enums/framing-type-id";

export interface Framing {
    id: string;
    title: string;
    creatorId: string;
    boardId: string;
    framingTypeId: FramingTypeId;
    content: string;
    position: FindPosition;
    createdAt: Date;
    updatedAt: Date;
}

export const Framing = model<Framing>(
    'Framing', 
    new Schema({
        title: { type: String, required: true },
        creatorId: { type: String, ref: 'User', required: true },
        boardId: { type: String, ref: 'Board', required: true },
        framingTypeId: { type: String, enum: Object.values(FramingTypeId), required: true },
        content: { type: String, required: true },
        position: { type: Schema.Types.Mixed, required: true },
    }, {
        timestamps: true
    })
);