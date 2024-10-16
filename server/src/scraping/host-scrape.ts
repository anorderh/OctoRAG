import { ScrapeMetadata } from "./utils/interfaces/scrape-metadata.js";
import { Document } from "@langchain/core/documents";
import { FindType } from "src/data/utils/constants/find-type.js";
import { Find } from "src/data/collections/board.collection.js";
import { ScrapeEntry } from "./utils/classes/scrape-entry.js";
import { App } from "src/App.js";
import { ScrapeOption } from "./utils/types/scrape-option.js";
import { scrapeMediaWebpage } from "./options/hosted/media/media-webpage.js";
import { ScrapeHostedOption } from "./utils/types/scrape-hosted-option.js";
import { scrapeMediaPDF } from "./options/hosted/media/media-pdf.js";
import { scrapeGithubRepo } from "./options/hosted/github/github-repo.js";
import { scrapeYoutubeVideo } from "./options/hosted/youtube/youtube-video.js";
import { scrapeRedditPost } from "./options/hosted/reddit/reddit-post.js";
import { scrapeXPost } from "./options/hosted/x/x-post.js";
import { scrapeTiktokPost } from "./options/hosted/tiktok/tiktok-post.js";

export class HostScrape {
    static options: {[key: string]: ScrapeHostedOption} = {
        [FindType.GithubRepo]: scrapeGithubRepo,
        [FindType.YoutubeVideo]: scrapeYoutubeVideo,
        [FindType.RedditPost]: scrapeRedditPost,
        [FindType.XPost]: scrapeXPost,
        [FindType.TiktokPost]: scrapeTiktokPost,
        [FindType.MediaPDF]: scrapeMediaPDF,
        [FindType.MediaWebpage]: scrapeMediaWebpage,
    }
    
    url: URL;
    options: ScrapeHostedOption[] = [];

    constructor(find: Find) {
        this.url = new URL(find.link);

        let option: ScrapeHostedOption = HostScrape.options[find.type];
        if (!!option) {
            this.options.push(option)
        }

        // Include webpage scrape as option, if not present.
        if (option != scrapeMediaWebpage) {
            this.options.push(scrapeMediaWebpage);
        }
    }

    public async scrape(): Promise<ScrapeEntry<any>[] | null> {
        let currOption: ScrapeHostedOption;
        // Attempt scrape until all options depleted.
        while (this.options.length > 0) {
            try {
                currOption = this.options.shift();
                let entries: ScrapeEntry<any>[] = await currOption(this.url);
                return entries;
            } catch (err: any) {
                App.logger.error(
                    `Scrape option "${typeof(currOption)}" failed to scrape.`
                );
            }
        }

        App.logger.error(
            `A scrape for "${this.url.toString()}" could not be performed.`
        );
        return null;
    }
}