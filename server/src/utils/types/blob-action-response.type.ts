import { BlobActionResult } from "../enums/blob-action-result.enum"

export type BlobActionResponse = {
    result: BlobActionResult,
    content?: any
}