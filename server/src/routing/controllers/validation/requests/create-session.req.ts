import { ObjectId } from "mongodb"

export interface CreateSessionRequest {
    _libraryId: ObjectId,
    llmModel: string,
    forceNewScrape?: boolean,
    embeddingModel?: string
}