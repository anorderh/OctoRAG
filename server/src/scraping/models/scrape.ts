import { ScrapeEntry, ScrapeMetadata } from "./scrape-entry";
import { Document } from "@langchain/core/documents";
import { ScrapeOption } from "./scrape-option";
import { FindType } from "src/utils/enums/find-type";
import { GithubRepoScrapeOption } from "../options/github-repo";
import { YoutubeVideoScrapeOption } from "../options/youtube-video";
import { WebpageScrapeOption } from "../options/webpage";
import { Find } from "src/data/collections";

export class Scrape {
    static options: {[key: string]: ScrapeOption<any>} = {
        [FindType.Webpage]: WebpageScrapeOption,
        [FindType.GithubRepo]: GithubRepoScrapeOption,
        [FindType.YoutubeVideo]: YoutubeVideoScrapeOption
    }
    
    url: URL;
    options: ScrapeOption<ScrapeMetadata>[] = [];
    entries: ScrapeEntry<ScrapeMetadata>[] = [];
    chunks: Document[] = [];

    constructor(find: Find) {
        this.url = new URL(find.link);

        let mappedOption : ScrapeOption<any> = Scrape.options[find.type];
        if (!!mappedOption) {
            this.options.push(mappedOption)
        }

        // Include webpage scrape as option, if not present.
        if (mappedOption != WebpageScrapeOption) {
            this.options.push(WebpageScrapeOption);
        }
    }
}