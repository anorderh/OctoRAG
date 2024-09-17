import { FindType } from '../enums/find-type';

export interface ScrapeOptions {
    type: FindType;
    link: string;
    url: URL;
}