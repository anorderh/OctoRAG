import { ScrapeEntry } from "../classes/scrape-entry";

export type ResourceScrapeOption = (path: string) => Promise<ScrapeEntry<any>[]>