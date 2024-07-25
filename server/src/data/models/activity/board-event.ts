import { Schema, model } from "mongoose";
import { EventDescriptor } from "../../../utils/enums/event-descriptor";

export interface BoardEvent {
    id: string,
    name: string,
    eventType: EventDescriptor,
    boardId: string,
    occurred: Date
}

export const BoardEvent = model(
    'BoardEvent', 
    new Schema({
        name: {type: String, required: true},
        eventType: {type: String, enum: Object.values(EventDescriptor), required: true},
        boardId: {type: String, required: true},
        occurred: { type: Date, default: () => Date.now() }
    })
)