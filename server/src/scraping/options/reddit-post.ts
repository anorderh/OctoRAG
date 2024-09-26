import axios from "axios";
import * as cheerio from 'cheerio';
import { UUID } from "mongodb";
import { InvalidFindLinkFormatError, ScrapeEntryFailedError } from "src/error-handling/errors";
import { downloadFile } from "src/utils/extensions/download-file";
import { env } from "src/env";
import AdmZip from "adm-zip";
import * as fs from 'fs';
import { RecursiveCharacterTextSplitter, RecursiveCharacterTextSplitterParams } from "langchain/text_splitter";
import { fileExtToTextSplitterLang } from "src/utils/extensions/file-ext-to-text-splitter-lang";
import { Document } from "@langchain/core/documents";
import path from "path";
import { InstanceDeps } from "src/utils/enums/instance-deps";
import { container } from "tsyringe";
import { Octokit } from "@octokit/rest";
import { FindType } from "src/utils/enums/find-type";
import { ScrapeOption } from "../models/scrape-option";
import { ScrapeEntry, ScrapeMetadata } from "../models/scrape-entry";
import Snoowrap from "snoowrap";
import { parseRegex } from "src/utils/extensions/parse-regex";

export interface RedditPostMetadata extends ScrapeMetadata {
    link: string;
    title: string;
    creator: string;
    subreddit: string;
}

export const RedditPostScrapeOption: ScrapeOption<RedditPostMetadata> = {
    fetch: async (url: URL) => {
        let reddit = container.resolve<Snoowrap>(InstanceDeps.Reddit);
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
            {
                id: new UUID().toString(),
                body,
                metadata: {
                    type: FindType.RedditPost,
                    link: url.href,
                    title,
                    creator,
                    subreddit
                }
            } as ScrapeEntry<RedditPostMetadata>
        ]
    },
    chunk: async (entries: ScrapeEntry<RedditPostMetadata>[]) => {
        let splitter = new RecursiveCharacterTextSplitter({
            chunkSize: env.defaults.chunking.chunkSize,
            chunkOverlap: env.defaults.chunking.chunkOverlap
        });

        let entry = entries[0];
        let docs: Document[] = []
        for (let text of (await splitter.splitText(entry.body))) {
            docs.push(
                new Document({
                    id: new UUID().toString(),
                    pageContent: text,
                    metadata: entry.metadata
                })
            )
        }
        return docs;
    }
}