import { ScrapeMetadata } from '../classes/scrape-metadata';

export interface RedditPostMetadata extends ScrapeMetadata {
    link: string;
    title: string;
    creator: string;
    subreddit: string;
}
