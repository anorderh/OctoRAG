import { ScrapeEntry } from '../abstract/scrape-entry';

export type OnlineResourceScrapeOption = (
    url: URL,
) => Promise<ScrapeEntry<any>[]>;
