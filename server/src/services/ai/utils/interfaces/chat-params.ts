import { ObjectId } from "mongodb";

export interface ChatParams {
    input: string;
    _sessionId: ObjectId;
}