import { BlobActionResult } from "../constants/blob-action-result.enum"

export interface BlobActionResponse {
    result: BlobActionResult,
    content?: any
}