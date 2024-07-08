import { Schema } from "mongoose";

export interface Credentials {
    _id: Number,
    accountId: string,
    hash: string
}

export const credentialsSchema = new Schema({
    _id: {type: Number, required: true},
    accountId: {type: String, required: true},
    hash: {type: Number, required: true}
})