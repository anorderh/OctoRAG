import { Library } from "src/data/collections/library.collection";
import { Scrape } from "src/data/collections/scrape.collection";

export interface CreateSessionParams {
    library: Library;
    llmModel: string;
    forceNewScrape: boolean;
    embeddingModel?: string; // Incase library has not yet been scraped.
}