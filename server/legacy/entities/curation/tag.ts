import { model, ObjectId, Schema, Types } from "mongoose";

export interface Tag {
    id: ObjectId;
    name: string;
    boards: ObjectId[];
    active: boolean;
}

export const Tag = model<Tag>(
    'Tag', 
    new Schema({
        name: { type: String, required: true },
        active: { type: Boolean, default: true},
        boards: [{type: Types.ObjectId, ref: 'Board', default: []}],
    })
);