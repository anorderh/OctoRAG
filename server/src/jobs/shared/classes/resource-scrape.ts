import { App } from 'src/App.js';
import { ScrapeEntry } from '../abstract/scrape-entry.js';
import { ResourceScrapeOption } from '../types/scrape-uploaded-option.js';

export class ResourceScrape {
    static options: { [key: string]: ResourceScrapeOption } = {
        // No upload scrape options implemented.
    };

    path: string;
    options: ResourceScrapeOption[] = [];

    constructor(path: string) {
        this.path = path;
        // TBD.
    }

    public async scrape(): Promise<ScrapeEntry<any>[] | null> {
        let currOption: ResourceScrapeOption;

        // Attempt scrape until all options depleted.
        while (this.options.length > 0) {
            try {
                // TBD
                return [];
            } catch (err: any) {
                App.logger.error(
                    `Scrape option "${typeof currOption}" failed to scrape.`,
                );
            }
        }

        App.logger.error(`A scrape for "${this.path}" could not be performed.`);
    }
}
