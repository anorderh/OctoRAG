import { ScrapeMetadata } from '../classes/scrape-metadata';

export interface YoutubeVideoMetadata extends ScrapeMetadata {
    title: string;
    desc?: string;
    creator: string;
}
