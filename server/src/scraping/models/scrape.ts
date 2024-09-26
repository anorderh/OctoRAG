import { ScrapeEntry, ScrapeMetadata } from "./scrape-entry";
import { Document } from "@langchain/core/documents";
import { ScrapeOption } from "./scrape-option";
import { FindType } from "src/utils/enums/find-type";
import { GithubRepoScrapeOption } from "../options/github-repo";
import { YoutubeVideoScrapeOption } from "../options/youtube-video";
import { WebpageScrapeOption } from "../options/webpage";
import { Find } from "src/data/collections";
import { RedditPostScrapeOption } from "../options/reddit-post";
import { TiktokPostScrapeOption } from "../options/tiktok-post";
import { PDFScrapeOption } from "../options/pdf";
import { TwitterPostScrapeOption } from "../options/twitter-post";

export class Scrape {
    static options: {[key: string]: ScrapeOption<any>} = {
        [FindType.Webpage]: WebpageScrapeOption,
        [FindType.GithubRepo]: GithubRepoScrapeOption,
        [FindType.YoutubeVideo]: YoutubeVideoScrapeOption,
        [FindType.RedditPost]: RedditPostScrapeOption,
        [FindType.TwitterPost]: TwitterPostScrapeOption,
        [FindType.TiktokPost]: TiktokPostScrapeOption,
        [FindType.PDF]: PDFScrapeOption
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