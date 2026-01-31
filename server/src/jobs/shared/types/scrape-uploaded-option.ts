import { ScrapeEntry } from '../abstract/scrape-entry';

export type ResourceScrapeOption = (
    path: string,
) => Promise<ScrapeEntry<any>[]>;
