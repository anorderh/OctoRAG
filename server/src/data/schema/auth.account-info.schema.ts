import { Schema, model } from "mongoose";

export const AccountInfo = model(
    'AccountInfo',
    new Schema({
        _id: {type: Number, required: true},
        accountId: {type: Number, required: true},
        profilePath: {type: String, required: true},
        desc: {type: String, required: true},
    }) 
);