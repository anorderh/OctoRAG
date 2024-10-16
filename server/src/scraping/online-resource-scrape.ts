import { ScrapeMetadata } from "./utils/interfaces/scrape-metadata.js";
import { Document } from "@langchain/core/documents";
import { ScrapeEntry } from "./utils/classes/scrape-entry.js";
import { App } from "src/App.js";
import { ScrapeOption } from "./utils/types/scrape-option.js";
import { scrapeMediaWebpage } from "./options/online-resource/media/media-webpage.js";
import { OnlineResourceScrapeOption } from "./utils/types/scrape-hosted-option.js";
import { scrapeMediaPDF } from "./options/online-resource/media/media-pdf.js";
import { scrapeGithubRepo } from "./options/online-resource/github/github-repo.js";
import { scrapeYoutubeVideo } from "./options/online-resource/youtube/youtube-video.js";
import { scrapeRedditPost } from "./options/online-resource/reddit/reddit-post.js";
import { scrapeXPost } from "./options/online-resource/x/x-post.js";
import { scrapeTiktokPost } from "./options/online-resource/tiktok/tiktok-post.js";
import { OnlineResource } from "src/data/collections/online-resource.collection.js";
import { OnlineResourceType } from "src/data/utils/constants/online-resource-type.js";

export class OnlineResourceScrape {
    static options: {[key: string]: OnlineResourceScrapeOption} = {
        [OnlineResourceType.GithubRepo]: scrapeGithubRepo,
        [OnlineResourceType.YoutubeVideo]: scrapeYoutubeVideo,
        [OnlineResourceType.RedditPost]: scrapeRedditPost,
        [OnlineResourceType.XPost]: scrapeXPost,
        [OnlineResourceType.TiktokPost]: scrapeTiktokPost,
        [OnlineResourceType.MediaPDF]: scrapeMediaPDF,
        [OnlineResourceType.MediaWebpage]: scrapeMediaWebpage,
    }
    
    url: URL;
    options: OnlineResourceScrapeOption[] = [];

    constructor(onlineResource: OnlineResource) {
        this.url = new URL(onlineResource.url);

        let option: OnlineResourceScrapeOption = OnlineResourceScrape.options[onlineResource.type];
        if (!!option) {
            this.options.push(option)
        }

        // Include webpage scrape as option, if not present.
        if (option != scrapeMediaWebpage) {
            this.options.push(scrapeMediaWebpage);
        }
    }

    public async scrape(): Promise<ScrapeEntry<any>[] | null> {
        let currOption: OnlineResourceScrapeOption;
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