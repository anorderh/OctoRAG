import { ObjectId } from "mongodb";

export interface ScrapeLibraryRequest {
    _libraryId: string;
    embeddingModel: string;
}