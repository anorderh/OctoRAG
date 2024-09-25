import { ObjectId } from "mongodb"
import { Pagination } from "./pagination"

export interface HttpContext {
    userId: ObjectId
    pagination: Pagination
}