import { ScrapeHostedOption } from "./scrape-hosted-option";
import { ScrapeUploadedOption } from "./scrape-uploaded-option";

export type ScrapeOption = ScrapeHostedOption | ScrapeUploadedOption;