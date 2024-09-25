import { Document } from "@langchain/core/documents";
import { ScrapeEntry } from "./scrape-entry";
import { ScrapeMetadata } from "./scrape-entry";


export interface ScrapeOption<T extends ScrapeMetadata> {
    fetch(url: URL):  Promise<ScrapeEntry<T>[]>,
    chunk(entries: ScrapeEntry<T>[]): Promise<Document[]>,
}