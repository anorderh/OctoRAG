import { Schema, model } from "mongoose";

export const RefreshToken = model(
    'RefreshToken', 
    new Schema({
        _id: {type: Number, required: true},
        accountId: {type: String, required: true},
        hash: {type: Number, required: true}
    })
);