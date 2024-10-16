import axios from "axios";
import * as cheerio from 'cheerio';
import { UUID } from "mongodb";
import { InvalidURLFormatError, ScrapeEntryFailedError } from "src/error-handling/errors.js";
import AdmZip from "adm-zip";
import * as fs from 'fs';
import { RecursiveCharacterTextSplitter, RecursiveCharacterTextSplitterParams } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import path from "path";
import { container } from "tsyringe";
import Snoowrap from "snoowrap";
import { ScrapeMetadata } from "../../../utils/interfaces/scrape-metadata";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token";
import { parseRegex } from "src/shared/utils/helpers/parse-regex";
import { OnlineResourceType } from "src/data/utils/constants/online-resource-type";
import { ScrapeEntry } from "../../../utils/classes/scrape-entry";
import { env } from "src/shared/utils/constants/env";
import { RedditPostScrapeEntry } from "src/scraping/entries/online-resource/reddit/reddit-post";
import { RedditPostMetadata } from "./utils/interfaces/reddit-post-metadata";

export async function scrapeRedditPost(url: URL) : Promise<RedditPostScrapeEntry[]> {
    let reddit = container.resolve<Snoowrap>(DependencyInjectionToken.Snoowrap);
    let videoId = parseRegex(
        url.toString(),
        /comments\/([a-zA-Z0-9]+)\//
    );
    if (videoId == null) {
        throw new ScrapeEntryFailedError({
            status: 502,
            body: "A Reddit submission ID could not be parsed from the URL."
        })
    }

    let res = reddit.getSubmission(videoId);
    let body = await res.selftext;
    let title = await res.title;
    let creator = await res.author.name
    let subreddit = await res.subreddit.display_name

    return [
        new RedditPostScrapeEntry({
            id: new UUID().toString(),
            body,
            metadata: {
                type: OnlineResourceType.RedditPost,
                link: url.href,
                title,
                creator,
                subreddit
            }
        })
    ]
}