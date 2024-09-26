import { Document } from "@langchain/core/documents";
import { ScrapeEntry } from "./scrape-entry.js";
import { ScrapeMetadata } from "./scrape-entry.js";


export interface ScrapeOption<T extends ScrapeMetadata> {
    fetch(url: URL):  Promise<ScrapeEntry<T>[]>,
    chunk(entries: ScrapeEntry<T>[]): Promise<Document[]>,
}