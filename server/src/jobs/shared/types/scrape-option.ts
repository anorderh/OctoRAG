import { OnlineResourceScrapeOption } from "./scrape-hosted-option";
import { ResourceScrapeOption } from "./scrape-uploaded-option";

export type ScrapeOption = OnlineResourceScrapeOption | ResourceScrapeOption;