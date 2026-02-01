import { ScrapeMetadata } from '../classes/scrape-metadata';

export interface XPostMetadata extends ScrapeMetadata {
    link: string;
    author: string;
}
