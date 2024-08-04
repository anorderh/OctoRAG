import { ObjectId } from "mongodb";
import { Schema, Types, model } from "mongoose";
import { EventDescriptor } from "../../../utils/enums/event-descriptor";

export interface UserEvent {
    id: ObjectId,
    name: string,
    eventType: EventDescriptor,
    userId: ObjectId,
    occurred: Date
}

export const UserEvent = model(
    'UserEvent', 
    new Schema({
        name: {type: String, required: true},
        eventType: {type: String, enum: Object.values(EventDescriptor), required: true},
        userId: {type: Types.ObjectId, ref: 'User', required: true},
        occurred: { type: Date, default: () => Date.now()}
    })
)