import { ScrapeMetadata } from "./utils/interfaces/scrape-metadata.js";
import { Document } from "@langchain/core/documents";
import { FindType } from "src/data/utils/constants/find-type.js";
import { Find } from "src/data/collections/board.collection.js";
import { ScrapeEntry } from "./utils/classes/scrape-entry.js";
import { App } from "src/App.js";
import { ScrapeOption } from "./utils/types/scrape-option.js";
import { scrapeMediaWebpage } from "./options/hosted/media/media-webpage.js";
import { ScrapeUploadedOption } from "./utils/types/scrape-uploaded-option.js";

export class UploadScrape {
    static options: {[key: string]: ScrapeUploadedOption} = {
        // No upload scrape options implemented.
    }
    
    path: string;
    options: ScrapeUploadedOption[] = [];

    constructor(path: string) {
        this.path = path;
        // TBD.
    }

    public async scrape(): Promise<ScrapeEntry<any>[] | null> {
        let currOption: ScrapeUploadedOption;

        // Attempt scrape until all options depleted.
        while (this.options.length > 0) {
            try {
                // TBD
                return [];
            } catch (err: any) {
                App.logger.error(
                    `Scrape option "${typeof(currOption)}" failed to scrape.`
                );
            }
        }

        App.logger.error(
            `A scrape for "${this.path}" could not be performed.`
        );
    }
}