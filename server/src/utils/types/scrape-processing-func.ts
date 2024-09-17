import { ScrapeOptions } from '../interfaces/scrape-options';
import { ScrapeResult } from '../interfaces/scrape-result';

export type ScrapeProcessingFunction = (options: ScrapeOptions) => Promise<ScrapeResult[]>;