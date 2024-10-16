import { ObjectId } from "mongodb";

export interface EventInput {
    event: string,
    userId?: ObjectId,
    boardId?: ObjectId,
    ref?: any,
}