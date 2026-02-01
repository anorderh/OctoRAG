import { Document } from 'langchain/document';
import {
    RecursiveCharacterTextSplitter,
    TextSplitter,
} from 'langchain/text_splitter';
import { UUID } from 'mongodb';
import { env } from 'src/shared/constants/env';
import { ScrapeEntry } from '../abstract/scrape-entry';
import { XPostMetadata } from '../interfaces/x-post-metadata';

export class XPostScrapeEntry extends ScrapeEntry<XPostMetadata> {
    static splitter: TextSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: env.defaults.chunking.chunkSize,
        chunkOverlap: env.defaults.chunking.chunkOverlap,
    });

    async chunk() {
        let docs: Document[] = [];
        for (let text of await XPostScrapeEntry.splitter.splitText(this.body)) {
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
