import { Schema } from "mongoose";
import { ResourceType } from "../../utils/enums/resource-type.enum";

export interface Resource {
    _id: Number,
    accountId: Number,
    workspaceId: Number,
    type: ResourceType,
    path: String,
    createdBy: Date,
    updatedBy: Date,
}

export const resourceSchema = new Schema({
    _id: {type: Number, required: true},
    accountId: {type: Number, required: true},
    workspaceId: {type: Number, required: true},
    type: {type: String, enum: Object.values(ResourceType), required: true},
    path: {type: String, required: true}
}, {
    timestamps: true
})