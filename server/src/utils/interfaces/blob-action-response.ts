import { BlobActionResult } from '../enums/blob-action-result.enum'

export interface BlobActionResponse {
    result: BlobActionResult,
    content?: any
}