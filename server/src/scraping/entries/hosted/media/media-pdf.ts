import { RecursiveCharacterTextSplitter, TextSplitter } from "langchain/text_splitter";
import { ScrapeEntry } from "src/scraping/utils/classes/scrape-entry";
import { env } from "src/shared/utils/constants/env";
import { Document } from "langchain/document";
import { UUID } from "mongodb";
import { MediaScrapeMetadata } from "src/scraping/options/hosted/media/utils/interfaces/media-scrape-metadata";

export interface MediaPDFMetadata extends MediaScrapeMetadata {
    title: string; // DEBUG - Can remove this if its not possible.
}

export class MediaPDFScrapeEntry extends ScrapeEntry<MediaPDFMetadata> {
    static splitter: TextSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: env.defaults.chunking.chunkSize,
        chunkOverlap: env.defaults.chunking.chunkOverlap
    });

    async chunk() {
        let docs: Document[] = [];
        for (let text of (await MediaPDFScrapeEntry.splitter.splitText(this.body))) {
            docs.push(
                new Document({
                    id: new UUID().toString(),
                    pageContent: text,
                    metadata: this.metadata
                })
            )
        }
        return docs;
    }
}