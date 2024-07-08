import { Schema } from "mongoose";

export interface AccountStats {
    _id: Number,
    accountId: Number,
    workspacesCreated: Number,
    minsSpent: Number
}

export const accountStatsSchema = new Schema({
    _id: {type: Number, required: true},
    accountId: {type: Number, required: true},
    workspacesCreated: {type: Number, required: true},
    minsSpent: {type: Number, required: true},
})