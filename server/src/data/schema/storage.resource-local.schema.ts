import { Schema, model } from "mongoose";
import { ResourceType } from "../../utils/enums/resource-type.enum";

export const ResourceLocal = model(
    'ResourceLocal',
    new Schema({
        _id: {type: Number, required: true},
        accountId: {type: Number, required: true},
        workspaceId: {type: Number, required: true},
        type: {type: String, enum: Object.values(ResourceType), required: true},
        path: {type: String, required: true}
    }, {
        timestamps: true
    })
);