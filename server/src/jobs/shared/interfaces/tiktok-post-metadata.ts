import { ScrapeMetadata } from '../classes/scrape-metadata';

export interface TiktokPostMetadata extends ScrapeMetadata {
    link: string;
    desc: string;
    author: string;
}
