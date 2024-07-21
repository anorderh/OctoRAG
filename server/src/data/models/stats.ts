import { Schema, model } from "mongoose";

export const Stats = model(
    'Stats', 
    new Schema({
        _id: {type: Number, required: true},
        accountId: {type: Number, required: true},
    })
)