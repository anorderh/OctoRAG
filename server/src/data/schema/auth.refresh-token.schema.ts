import { Schema } from "mongoose";

export interface RefreshToken {
    _id: Number,
    accountId: string,
    hash: string
}

export const refreshTokenSchema = new Schema({
    _id: {type: Number, required: true},
    accountId: {type: String, required: true},
    hash: {type: Number, required: true}
})