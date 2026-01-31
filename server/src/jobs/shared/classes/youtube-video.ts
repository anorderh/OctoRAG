import { Document } from 'langchain/document';
import {
    RecursiveCharacterTextSplitter,
    TextSplitter,
} from 'langchain/text_splitter';
import { UUID } from 'mongodb';
import { YoutubeVideoMetadata } from 'src/scraping/options/online-resource/youtube/utils/interfaces/youtube-video-metadata';
import { ScrapeEntry } from 'src/scraping/utils/classes/scrape-entry';
import { env } from 'src/shared/constants/env';

export class YoutubeVideoScrapeEntry extends ScrapeEntry<YoutubeVideoMetadata> {
    static splitter: TextSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: env.defaults.chunking.chunkSize,
        chunkOverlap: env.defaults.chunking.chunkOverlap,
    });

    async chunk() {
        let docs: Document[] = [];
        for (let text of await YoutubeVideoScrapeEntry.splitter.splitText(
            this.body,
        )) {
            docs.push(
                new Document({
                    id: new UUID().toString(),
                    pageContent: text,
                    metadata: this.metadata,
                }),
            );
        }
        return docs;
    }
}
