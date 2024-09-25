import axios from "axios";
import * as cheerio from 'cheerio';
import { UUID } from "mongodb";
import { ScrapeResult } from "src/utils/interfaces/scrape-result";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { env } from "src/env";
import { limitStringLength } from "src/utils/extensions/limit-str-length";
import { Document } from "@langchain/core/documents";
import { FindType } from "src/utils/enums/find-type";
import { ScrapeOption } from "../models/scrape-option";
import { ScrapeEntry, ScrapeMetadata } from "../models/scrape-entry";
import { ScrapeEntryFailedError } from "src/error-handling/errors";

export interface WebpageMetadata extends ScrapeMetadata {
    link: string,
    title?: string,
    desc?: string,
    keywords?: string
}

export const WebpageScrapeOption: ScrapeOption<WebpageMetadata> = {
    fetch: async (url: URL) => {
        const charMaxLimit = 30000; // Max webpage char limit.
        const res = await axios.get(url.href); 
        const $ = cheerio.load(res.data);

        // Pull content.
        const title = $('title').text() || 'No Title Found';
        const textContent = $('body').text().replace(/\s\s+/g, ' ');
        const desc = $('meta[name="description"]').attr('content') || 'No Description Found';
        const keywords = $('meta[name="keywords"]').attr('content') || 'No Keywords Found';

        if (textContent.length > charMaxLimit) {
            throw new ScrapeEntryFailedError({
                body: `The webpage scrape for "${url.href}" is prohibited due to passing the maximum character limit allowed.`
            })
        }

        return [
            {
                id: new UUID().toString(),
                body: textContent,
                metadata: {
                    type: FindType.Webpage,
                    link: url.href,
                    ...limitStringLength({
                        title: title.slice(0, 100),
                        desc: desc.slice(0, 100),
                        keywords: keywords.slice(0, 100)
                    })
                }
            } as ScrapeEntry<WebpageMetadata>
        ];
    },
    chunk: async (entries: ScrapeEntry<WebpageMetadata>[]) => {
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
