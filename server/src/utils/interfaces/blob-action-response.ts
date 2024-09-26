import { BlobActionResult } from '../enums/blob-action-result.enum.js'

export interface BlobActionResponse {
    result: BlobActionResult,
    content?: any
}