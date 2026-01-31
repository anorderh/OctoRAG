import { ScrapeMetadata } from "src/scraping/utils/interfaces/scrape-metadata";

export interface RedditPostMetadata extends ScrapeMetadata {
    link: string;
    title: string;
    creator: string;
    subreddit: string;
}