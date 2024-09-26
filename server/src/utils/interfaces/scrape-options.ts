import { FindType } from '../enums/find-type.js';

export interface ScrapeOptions {
    type: FindType;
    link: string;
    url: URL;
}