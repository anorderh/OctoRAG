import axios from "axios";
import * as cheerio from 'cheerio';
import fs from 'fs';
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
import { parseRegex } from "src/utils/extensions/parse-regex";
import pdf from 'pdf-parse';
import { downloadFile } from "src/utils/extensions/download-file";
import { LlamaParseReader } from "@llamaindex/cloud/reader";

export interface PDFMetadata extends ScrapeMetadata {
    link: string,
    filename: string,
}

export const PDFScrapeOption: ScrapeOption<PDFMetadata> = {
    fetch: async (url: URL) => {
        let filename = parseRegex(
            url.toString(),
            /\/([^\/?#]+\.pdf)(?:[?#]|$)/i
        );
        if (filename == null) {
            throw new ScrapeEntryFailedError({
                status: 502,
                body: "A PDF could not be retrieved from the following URL."
            })
        }

        // Download file and temporarily save to disk.
        fs.mkdirSync(env.pathes.temp, { recursive: true });
        let pdfPath = `${env.pathes.temp}/${new UUID().toString()}.pdf`
        await downloadFile(url.toString(), pdfPath);

        // Read using LlamaParseReader.
        let reader = new LlamaParseReader({
           resultType: "markdown",
           apiKey: env.llamacloud.apiKey 
        }) as LlamaParseReader;
        

        // Read PDF into str array and delete file.
        let data = await pdf(fs.readFileSync(pdfPath));
        fs.unlinkSync(pdfPath);
        let content = data.text;

        return [
            {
                id: new UUID().toString(),
                body: content,
                metadata: {
                    type: FindType.PDF,
                    link: url.toString(),
                    filename
                } as PDFMetadata
            } as ScrapeEntry<PDFMetadata>
        ]
    },
    chunk: async (entries: ScrapeEntry<PDFMetadata>[]) => {
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
