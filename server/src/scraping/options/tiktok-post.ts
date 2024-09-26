import axios from "axios";
import * as cheerio from 'cheerio';
import { UUID } from "mongodb";
import { InvalidFindLinkFormatError, ScrapeEntryFailedError } from "src/error-handling/errors.js";
import { downloadFile } from "src/utils/extensions/download-file.js";
import { env } from "src/env.js";
import AdmZip from "adm-zip";
import * as fs from 'fs';
import { RecursiveCharacterTextSplitter, RecursiveCharacterTextSplitterParams } from "langchain/text_splitter";
import { fileExtToTextSplitterLang } from "src/utils/extensions/file-ext-to-text-splitter-lang.js";
import { Document } from "@langchain/core/documents";
import path from "path";
import { InstanceDeps } from "src/utils/enums/instance-deps.js";
import { container } from "tsyringe";
import { Octokit } from "@octokit/rest";
import { FindType } from "src/utils/enums/find-type.js";
import { ScrapeOption } from "../models/scrape-option.js";
import { ScrapeEntry, ScrapeMetadata } from "../models/scrape-entry.js";
import Snoowrap from "snoowrap";
import { parseRegex } from "src/utils/extensions/parse-regex.js";
import { TokScript, TokScriptResponse } from "src/utils/extensions/tokscript.js";

export interface TiktokPostMetadata extends ScrapeMetadata {
    link: string;
    desc: string;
    author: string;
}

export const TiktokPostScrapeOption: ScrapeOption<TiktokPostMetadata> = {
    fetch: async (url: URL) => {
        let tokScript = new TokScript();
        let res: TokScriptResponse = await tokScript.getVideoInfo(url);
        let transcript = tokScript
            .getTranscript(res)
            .map(cue => cue.text)
            .join(" ");

        if (transcript == null) {
            throw new ScrapeEntryFailedError({
                status: 502,
                body: "A transcript could not be grabbed from the provided Tiktok video."
            })
        }

        return [
            {
                id: new UUID().toString(),
                body: transcript,
                metadata: {
                    type: FindType.TiktokPost,
                    link: url.href,
                    desc: res.data.desc,
                    author: res.data.author.uniqueId
                }
            } as ScrapeEntry<TiktokPostMetadata>
        ]
    },
    chunk: async (entries: ScrapeEntry<TiktokPostMetadata>[]) => {
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