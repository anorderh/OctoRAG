import { UUID } from 'mongodb';
import Snoowrap from 'snoowrap';
import { OnlineResourceType } from 'src/database/shared/constants/online-resource-type';
import { DependencyInjectionToken } from 'src/integrations/shared/constants/dependency-injection-token';
import { ScrapeEntryFailedError } from 'src/shared/classes/errors.js';
import { parseRegex } from 'src/shared/utils/parse-regex';
import { container } from 'tsyringe';
import { RedditPostScrapeEntry } from './shared/classes/reddit-post';

export async function scrapeRedditPost(
    url: URL,
): Promise<RedditPostScrapeEntry[]> {
    let reddit = container.resolve<Snoowrap>(DependencyInjectionToken.Snoowrap);
    let videoId = parseRegex(url.toString(), /comments\/([a-zA-Z0-9]+)\//);
    if (videoId == null) {
        throw new ScrapeEntryFailedError({
            status: 502,
            body: 'A Reddit submission ID could not be parsed from the URL.',
        });
    }

    let res = reddit.getSubmission(videoId);
    let body = await res.selftext;
    let title = await res.title;
    let creator = await res.author.name;
    let subreddit = await res.subreddit.display_name;

    return [
        new RedditPostScrapeEntry({
            id: new UUID().toString(),
            body,
            metadata: {
                type: OnlineResourceType.RedditPost,
                link: url.href,
                title,
                creator,
                subreddit,
            },
        }),
    ];
}
