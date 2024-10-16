import axios from "axios";
import * as cheerio from 'cheerio';
import { UUID } from "mongodb";
import { InvalidFindLinkFormatError, ScrapeEntryFailedError } from "src/error-handling/errors.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import path from "path";
import { decode } from "html-entities";
import Innertube from "youtubei.js/agnostic";
import { container, inject } from "tsyringe";
import { YoutubeTranscript } from "youtube-transcript";
import { ScrapeMetadata } from "../../../utils/interfaces/scrape-metadata";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token";
import { FindType } from "src/data/utils/constants/find-type";
import { ScrapeEntry } from "../../../utils/classes/scrape-entry";
import { env } from "src/shared/utils/constants/env";
import { YoutubeVideoMetadata } from "./utils/interfaces/youtube-video-metadata";
import { YoutubeVideoScrapeEntry } from "src/scraping/entries/hosted/youtube/youtube-video";

export async function scrapeYoutubeVideo(url: URL) {
    let maxDurationLimit = 60 * 60; // 1 hour transcript limit.
    let innertube = container.resolve<Innertube>(DependencyInjectionToken.Innertube);
    let videoId = url.searchParams.get('v')
    if (
        !url.href.includes("youtube.com/watch")
        || videoId == null
    ) {
        throw new InvalidFindLinkFormatError();
    }

    let videoInfo = (await innertube.getBasicInfo(videoId)).basic_info;
    if (videoInfo.duration > maxDurationLimit) {
        throw new ScrapeEntryFailedError({
            body: `Youtube video scrape for "${url.href}" failed due to passing maximum allowed durration limit`
        })
    }

    let transcripts = await YoutubeTranscript.fetchTranscript(videoId);
    let rawTranscript = transcripts
        .map(t => decode(decode(t.text))) // Output from `youtube-transcript` node package is doubly HTML encoded.
        .join(" ");

    return [
        new YoutubeVideoScrapeEntry({
            id: new UUID().toString(),
            body: rawTranscript,
            metadata: {
                type: FindType.YoutubeVideo,
                title: videoInfo.title,
                desc: videoInfo.short_description,
                creator: videoInfo.author
            }
        })
    ]
}