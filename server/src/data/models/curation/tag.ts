import { model, Schema } from "mongoose";

export interface Tag {
    id: string;
    name: string;
    active: boolean;
}

export const Tag = model<Tag>(
    'Tag', 
    new Schema({
        name: { type: String, required: true },
        active: { type: Boolean, default: true},
    })
);