import axios from "axios";
import * as cheerio from 'cheerio';
import { UUID } from "mongodb";
import { InvalidFindLinkFormatError, ScrapeEntryFailedError } from "src/error-handling/errors.js";
import { downloadFile } from "src/utils/extensions/download-file.js";
import { env } from "src/env.js";
import AdmZip from "adm-zip";
import * as fs from 'fs';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { fileExtToTextSplitterLang } from "src/utils/extensions/file-ext-to-text-splitter-lang.js";
import { Document } from "@langchain/core/documents";
import path from "path";
import { decode } from "html-entities";
import Innertube from "youtubei.js/agnostic";
import { container, inject } from "tsyringe";
import { limitStringLength } from "src/utils/extensions/limit-str-length.js";
import { YoutubeTranscript } from "youtube-transcript";
import { FindType } from "src/utils/enums/find-type.js";
import { InstanceDeps } from "src/utils/enums/instance-deps.js";
import { ScrapeOption } from "../models/scrape-option.js";
import { ScrapeEntry, ScrapeMetadata } from "../models/scrape-entry.js";

export interface YoutubeTranscriptMetadata extends ScrapeMetadata {
    title: string;
    desc?: string;
    creator: string;
}

export const YoutubeVideoScrapeOption: ScrapeOption<YoutubeTranscriptMetadata> = {
    fetch: async (url: URL) => {
        let maxDurationLimit = 60 * 60; // 1 hour transcript limit.
        let innertube = container.resolve<Innertube>(InstanceDeps.Innertube);
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
            {
                id: new UUID().toString(),
                body: rawTranscript,
                metadata: {
                    type: FindType.YoutubeVideo,
                    title: videoInfo.title,
                    // desc: videoInfo.short_description,
                    creator: videoInfo.author
                }
            } as ScrapeEntry<YoutubeTranscriptMetadata>
        ]
    },
    chunk: async (entries: ScrapeEntry<YoutubeTranscriptMetadata>[]) => {
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