
import { RecursiveCharacterTextSplitter, RecursiveCharacterTextSplitterParams, TextSplitter } from "langchain/text_splitter";
import { fileExtToTextSplitterLang } from "src/services/ai/utils/constants/file-ext-to-text-splitter-lang";
import { Document } from "langchain/document";
import { UUID } from "mongodb";
import { ScrapeEntry } from "src/scraping/utils/classes/scrape-entry";
import { env } from "src/shared/utils/constants/env";
import { YoutubeVideoMetadata } from "src/scraping/options/hosted/youtube/utils/interfaces/youtube-video-metadata";

export class YoutubeVideoScrapeEntry extends ScrapeEntry<YoutubeVideoMetadata> {
    static splitter: TextSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: env.defaults.chunking.chunkSize,
        chunkOverlap: env.defaults.chunking.chunkOverlap
    });

    async chunk() {
        let docs: Document[] = []
        for (let text of (await YoutubeVideoScrapeEntry.splitter.splitText(this.body))) {
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