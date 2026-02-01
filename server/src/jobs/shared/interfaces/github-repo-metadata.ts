import { ScrapeMetadata } from '../classes/scrape-metadata';

export interface GithubRepoMetadata extends ScrapeMetadata {
    repoName: string;
    desc?: string;
    owner?: string;
}
