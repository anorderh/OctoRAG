import { ScrapeEntry } from "../classes/scrape-entry";

export type ScrapeHostedOption = (url: URL) => Promise<ScrapeEntry<any>[]>