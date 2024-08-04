import {Schema}


export interface BoardEvent {
    id: ObjectId;
    name: string,
    eventType: EventDescriptor,
    boardId: ObjectId,
    occurred: Date
}

export const BoardEvent = model(
    'BoardEvent', 
    new Schema({
        name: {type: String, required: true},
        eventType: {type: String, enum: Object.values(EventDescriptor), required: true},
        boardId: {type: Types.ObjectId, required: true},
        occurred: { type: Date, default: () => Date.now() }
    })
)