import { Library } from 'src/database/collections/library.collection';

export interface CreateSessionParams {
    library: Library;
    llmModel: string;
    forceNewScrape: boolean;
    embeddingModel?: string; // Incase library has not yet been scraped.
}
