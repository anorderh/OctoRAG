import { Schema } from "mongoose";

export interface AccountInfo {
    _id: Number,
    accountId: Number,
    profilePath: string,
    desc: string
}

export const accountInfoSchema = new Schema({
    _id: {type: Number, required: true},
    accountId: {type: Number, required: true},
    profilePath: {type: String, required: true},
    desc: {type: String, required: true},
})