import { Schema, model } from "mongoose";
import { EventType } from "../../../utils/enums/event-type";

export interface Notification{
    id: string,
    eventType: EventType;
    eventId: string;
    userId: string;
    msg: string,
    occurred: Date,
    acknowledged: boolean
}

export const Notification = model(
    'Notification', 
    new Schema({
        eventType: {type: String, enum: Object.values(EventType), required: true},
        eventId: {type: String, ref: 'Event', required: true},
        userId: {type: String, ref: 'User', required: true},
        msg: {type: String, required: true},
        occurred: {type: Date, required: true},
        acknowledged: {type: Boolean, default: false}
    })
)