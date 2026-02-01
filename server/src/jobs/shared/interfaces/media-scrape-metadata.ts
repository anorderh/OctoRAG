import { ScrapeMetadata } from '../classes/scrape-metadata';
import { MediaType } from '../constants/media-type';

export interface MediaScrapeMetadata extends ScrapeMetadata {
    mediaType: MediaType;
}
