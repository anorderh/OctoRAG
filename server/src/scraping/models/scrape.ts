import { ScrapeEntry, ScrapeMetadata } from "./scrape-entry.js";
import { Document } from "@langchain/core/documents";
import { ScrapeOption } from "./scrape-option.js";
import { FindType } from "src/utils/enums/find-type.js";
import { GithubRepoScrapeOption } from "../options/github-repo.js";
import { YoutubeVideoScrapeOption } from "../options/youtube-video.js";
import { WebpageScrapeOption } from "../options/webpage.js";
import { Find } from "src/data/collections/board.js";
import { RedditPostScrapeOption } from "../options/reddit-post.js";
import { TiktokPostScrapeOption } from "../options/tiktok-post.js";
import { PDFScrapeOption } from "../options/pdf.js";
import { TwitterPostScrapeOption } from "../options/twitter-post.js";

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