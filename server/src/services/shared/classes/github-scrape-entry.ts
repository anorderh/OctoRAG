import { Document } from 'langchain/document';
import {
    RecursiveCharacterTextSplitter,
    RecursiveCharacterTextSplitterParams,
    TextSplitter,
} from 'langchain/text_splitter';
import { UUID } from 'mongodb';
import { fileExtToTextSplitterLang } from 'src/services/shared/constants/file-ext-to-text-splitter-lang';

export interface GithubFileMetadata {
    filepath: string;
    ext?: string;
    text: string;
    contextSummary?: string;
    [key: string]: any;
}

export class GithubFileScrapeEntry {
    public id: string;
    public metadata: GithubFileMetadata;
    public splitter: TextSplitter;

    constructor(id: string, metadata: GithubFileMetadata) {
        let params = {
            chunkSize: 2000,
            chunkOverlap: 300,
        } as RecursiveCharacterTextSplitterParams;

        this.id = id;
        this.metadata = metadata;
        let lang = fileExtToTextSplitterLang[metadata.ext];
        this.splitter = !!lang
            ? RecursiveCharacterTextSplitter.fromLanguage(lang, params)
            : new RecursiveCharacterTextSplitter(params);
    }

    async chunk(): Promise<Document<GithubFileMetadata>[]> {
        let docs: Document<GithubFileMetadata>[] = [];
        for (let text of await this.splitter.splitText(this.metadata.text)) {
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
