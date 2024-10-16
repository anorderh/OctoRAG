import { ScrapeMetadata } from "src/scraping/utils/interfaces/scrape-metadata";

export interface GithubRepoMetadata extends ScrapeMetadata {
    repoName: string;
    desc?: string;
    owner?: string;
}