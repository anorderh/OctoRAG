import { ScrapeMetadata } from "src/scraping/utils/interfaces/scrape-metadata";

export interface XPostMetadata extends ScrapeMetadata {
    link: string,
    author: string
}