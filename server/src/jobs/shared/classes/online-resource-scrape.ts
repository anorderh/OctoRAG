import { App } from 'src/App.js';
import { OnlineResource } from 'src/database/collections/online-resource.collection.js';
import { OnlineResourceType } from 'src/database/shared/constants/online-resource-type.js';
import { scrapeGithubRepo } from 'src/jobs/scrape-github-repo.js';
import { scrapeMediaPDF } from 'src/jobs/scrape-media-pdf.js';
import { scrapeMediaWebpage } from 'src/jobs/scrape-media-webpage.js';
import { scrapeRedditPost } from 'src/jobs/scrape-reddit-post.js';
import { scrapeTiktokPost } from 'src/jobs/scrape-tiktok-post.js';
import { scrapeXPost } from 'src/jobs/scrape-x-post.js';
import { scrapeYoutubeVideo } from 'src/jobs/scrape-youtube-video.js';
import { ScrapeEntry } from '../abstract/scrape-entry.js';
import { OnlineResourceScrapeOption } from '../types/scrape-hosted-option.js';

export class OnlineResourceScrape {
    static options: { [key: string]: OnlineResourceScrapeOption } = {
        [OnlineResourceType.GithubRepo]: scrapeGithubRepo,
        [OnlineResourceType.YoutubeVideo]: scrapeYoutubeVideo,
        [OnlineResourceType.RedditPost]: scrapeRedditPost,
        [OnlineResourceType.XPost]: scrapeXPost,
        [OnlineResourceType.TiktokPost]: scrapeTiktokPost,
        [OnlineResourceType.MediaPDF]: scrapeMediaPDF,
        [OnlineResourceType.MediaWebpage]: scrapeMediaWebpage,
    };

    url: URL;
    options: OnlineResourceScrapeOption[] = [];

    constructor(onlineResource: OnlineResource) {
        this.url = new URL(onlineResource.url);

        let option: OnlineResourceScrapeOption =
            OnlineResourceScrape.options[onlineResource.type];
        if (!!option) {
            this.options.push(option);
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
                    `Scrape option "${typeof currOption}" failed to scrape.`,
                );
            }
        }

        App.logger.error(
            `A scrape for "${this.url.toString()}" could not be performed.`,
        );
        return null;
    }
}
