import { ScrapeEntry } from "../classes/scrape-entry";

export type OnlineResourceScrapeOption = (url: URL) => Promise<ScrapeEntry<any>[]>