import { BlobDownloadResponseParsed, BlobItem, BlobUploadCommonResponse } from "@azure/storage-blob"

export enum BlobActionResult {
    SUCCESS,
    ERROR
}

export type BlobActionResponse = {
    result: BlobActionResult,
    content?: any
}