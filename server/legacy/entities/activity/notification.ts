import { ObjectId, Schema, Types, model } from "mongoose";
import { EventType } from "../../../utils/enums/event-type";

export interface Notification{
    id: ObjectId;
    eventType: EventType;
    eventId: ObjectId;
    userId: ObjectId;
    msg: string,
    occurred: Date,
    acknowledged: boolean
}

export const Notification = model(
    'Notification', 
    new Schema({
        eventType: {type: String, enum: Object.values(EventType), required: true},
        eventId: {type: Types.ObjectId, ref: 'Event', required: true},
        userId: {type: Types.ObjectId, ref: 'User', required: true},
        msg: {type: String, required: true},
        occurred: {type: Date, required: true},
        acknowledged: {type: Boolean, default: false}
    })
)