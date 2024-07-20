import { Schema, model } from "mongoose";

export const AccountRequest = model(
    'AccountRequest', 
    new Schema({
        _id: {type: Number, required: true},
        accountId: {type: Number, required: true},
        hash: {type: String, required: true},
        expiration: {type: Date, required: true},
    })
)