import { ScrapeEntry } from "../classes/scrape-entry";

export type ScrapeUploadedOption = (path: string) => Promise<ScrapeEntry<any>[]>