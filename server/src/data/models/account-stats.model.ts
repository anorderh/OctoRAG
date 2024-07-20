import { Schema, model } from "mongoose";

export const AccountStats = model(
    'AccountStats', 
    new Schema({
        _id: {type: Number, required: true},
        accountId: {type: Number, required: true},
    })
)