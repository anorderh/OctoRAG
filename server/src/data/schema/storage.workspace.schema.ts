import { Schema, model } from "mongoose";

export const Workspace = model(
    'Workspace',
    new Schema({
        _id: {type: Number, required: true},
        accountId: {type: Number, required: true},
        name: {type: String, required: true}
    }, {
        timestamps: true
    })
)