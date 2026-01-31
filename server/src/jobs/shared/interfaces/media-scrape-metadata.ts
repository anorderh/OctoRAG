import { ScrapeMetadata } from 'src/scraping/utils/interfaces/scrape-metadata';
import { MediaType } from '../constants/media-type';

export interface MediaScrapeMetadata extends ScrapeMetadata {
    mediaType: MediaType;
}
