import { Schema, model } from "mongoose";

export const AccountToken = model(
    'AccountToken', 
    new Schema({
        _id: {type: Number, required: true},
        accountId: {type: String, required: true},
        hash: {type: Number, required: true}
    })
);