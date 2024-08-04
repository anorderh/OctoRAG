import { ObjectId } from "mongodb"

export interface HttpContext {
    userId: ObjectId
}