import { ScrapeMetadata } from "src/scraping/utils/interfaces/scrape-metadata";

export interface YoutubeVideoMetadata extends ScrapeMetadata {
    title: string;
    desc?: string;
    creator: string;
}