import { ScrapeMetadata } from "src/scraping/utils/interfaces/scrape-metadata";

export interface TiktokPostMetadata extends ScrapeMetadata {
    link: string;
    desc: string;
    author: string;
}