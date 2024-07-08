import { Schema } from "mongoose";

export interface AccountRequest {
    _id: Number,
    accountId: Number,
    hash: String,
    expiration: Date
}

export const accountRequestSchema = new Schema({
    _id: {type: Number, required: true},
    accountId: {type: Number, required: true},
    hash: {type: String, required: true},
    expiration: {type: Date, required: true},
})