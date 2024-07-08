import { Schema } from "mongoose";

export interface Workspace {
    _id: Number,
    accountId: Number,
    name: String,
    createdBy: Date,
    updatedBy: Date,
}

export const workspaceSchema = new Schema({
    _id: {type: Number, required: true},
    accountId: {type: Number, required: true},
    name: {type: String, required: true}
}, {
    timestamps: true
})