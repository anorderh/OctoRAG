import { ObjectId } from "mongodb";
import { Schema, model } from "mongoose";
import { EventDescriptor } from "../../../utils/enums/event-descriptor";

export interface UserEvent {
    id: string,
    name: string,
    eventType: EventDescriptor,
    userId: string,
    occurred: Date
}

export const UserEvent = model(
    'UserEvent', 
    new Schema({
        name: {type: String, required: true},
        eventType: {type: String, enum: Object.values(EventDescriptor), required: true},
        userId: {type: String, ref: 'User', required: true},
        occurred: { type: Date, default: () => Date.now()}
    })
)