import { Document } from 'langchain/document';
import {
    RecursiveCharacterTextSplitter,
    RecursiveCharacterTextSplitterParams,
} from 'langchain/text_splitter';
import { UUID } from 'mongodb';
import { GithubRepoMetadata } from 'src/scraping/options/online-resource/github/utils/interfaces/github-repo-metadata';
import { ScrapeEntry } from 'src/scraping/utils/classes/scrape-entry';
import { ScrapeEntryParams } from 'src/scraping/utils/interfaces/scrape-entry-params';
import { fileExtToTextSplitterLang } from 'src/services/shared/constants/file-ext-to-text-splitter-lang';
import { env } from 'src/shared/constants/env';

export interface GithubFileMetadata extends GithubRepoMetadata {
    filename: string;
    ext?: string;
}

export class GithubFileScrapeEntry extends ScrapeEntry<GithubFileMetadata> {
    constructor(entryParams: ScrapeEntryParams) {
        super(entryParams);

        let params = {
            chunkSize: env.defaults.chunking.chunkSize,
            chunkOverlap: env.defaults.chunking.chunkOverlap,
        } as RecursiveCharacterTextSplitterParams;
        let lang = fileExtToTextSplitterLang[this.metadata.ext];
        this.splitter = !!lang
            ? RecursiveCharacterTextSplitter.fromLanguage(lang, params)
            : new RecursiveCharacterTextSplitter(params);
    }

    async chunk() {
        let docs: Document[] = [];
        for (let text of await this.splitter.splitText(this.body)) {
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
