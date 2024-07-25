
import { Schema, model, Types } from "mongoose";

export interface Board {
    id: string;
    title: string;
    creatorId: string;
    followers: string[];
    tagIds: string[];
    views: number;
    clicks: number;
    saves: number;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

export const Board = model<Board>(
    'Board', 
    new Schema({
        title: {type: String, required: true},
        creatorId: {type: String, ref: 'User', required: true},
        followers: [{type: String, ref: 'User'}],
        tagIds: [{type: String, ref: 'Tag'}],
        views: {type: Number, default: 0},
        clicks: {type: Number, default: 0},
        saves: {type: Number, default: 0},
        active: {type: Boolean, default: true},
    }, {
        timestamps: true
    })
);