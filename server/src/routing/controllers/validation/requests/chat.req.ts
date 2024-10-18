import { ObjectId } from "mongodb";

export interface ChatRequest {
    input: string;
    _sessionId: ObjectId
}