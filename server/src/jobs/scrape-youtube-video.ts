import { decode } from 'html-entities';
import { UUID } from 'mongodb';
import { OnlineResourceType } from 'src/database/shared/constants/online-resource-type';
import { DependencyInjectionToken } from 'src/integrations/shared/constants/dependency-injection-token';
import {
    InvalidURLFormatError,
    ScrapeEntryFailedError,
} from 'src/shared/classes/errors.js';
import { container } from 'tsyringe';
import { YoutubeTranscript } from 'youtube-transcript';
import Innertube from 'youtubei.js/agnostic';
import { YoutubeVideoScrapeEntry } from './shared/classes/youtube-video';

export async function scrapeYoutubeVideo(url: URL) {
    let maxDurationLimit = 60 * 60; // 1 hour transcript limit.
    let innertube = container.resolve<Innertube>(
        DependencyInjectionToken.Innertube,
    );
    let videoId = url.searchParams.get('v');
    if (!url.href.includes('youtube.com/watch') || videoId == null) {
        throw new InvalidURLFormatError();
    }

    let videoInfo = (await innertube.getBasicInfo(videoId)).basic_info;
    if (videoInfo.duration > maxDurationLimit) {
        throw new ScrapeEntryFailedError({
            body: `Youtube video scrape for "${url.href}" failed due to passing maximum allowed durration limit`,
        });
    }

    let transcripts = await YoutubeTranscript.fetchTranscript(videoId);
    let rawTranscript = transcripts
        .map((t) => decode(decode(t.text))) // Output from `youtube-transcript` node package is doubly HTML encoded.
        .join(' ');

    return [
        new YoutubeVideoScrapeEntry({
            id: new UUID().toString(),
            body: rawTranscript,
            metadata: {
                type: OnlineResourceType.YoutubeVideo,
                title: videoInfo.title,
                desc: videoInfo.short_description,
                creator: videoInfo.author,
            },
        }),
    ];
}
