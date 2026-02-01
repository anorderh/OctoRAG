import { Library } from 'src/database/collections/library.collection';

export interface ScrapeLibraryParams {
    library: Library;
    embeddingModel: string;
}
