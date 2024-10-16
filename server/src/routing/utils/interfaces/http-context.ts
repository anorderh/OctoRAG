import { ObjectId } from "mongodb"
import { Pagination } from "./pagination.js"

export interface HttpContext {
    userId: ObjectId
    pagination: Pagination
}