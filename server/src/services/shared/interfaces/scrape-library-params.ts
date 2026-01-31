import { Library } from "src/data/collections/library.collection";

export interface ScrapeLibraryParams {
    library: Library;
    embeddingModel: string;
}