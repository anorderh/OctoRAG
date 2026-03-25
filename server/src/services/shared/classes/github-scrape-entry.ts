import { Document } from 'langchain/document';
import {
    RecursiveCharacterTextSplitter,
    TextSplitter,
} from 'langchain/text_splitter';
import { UUID } from 'mongodb';
import { fileExtToTextSplitterLang } from 'src/services/shared/constants/file-ext-to-text-splitter-lang';

export interface GithubFileMetadata {
    filepath: string;
    filename: string;
    repoUrl: string;
    fileUrl?: string;
    defaultBranch: string;
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
        const params = {
            chunkSize: 2000,
            chunkOverlap: 250,
        };

        this.id = id;
        this.metadata = metadata;

        const lang = fileExtToTextSplitterLang[metadata.ext];

        this.splitter = lang
            ? RecursiveCharacterTextSplitter.fromLanguage(lang, params)
            : new RecursiveCharacterTextSplitter(params);
    }

    async chunk(): Promise<Document<GithubFileMetadata>[]> {
        const docs: Document<GithubFileMetadata>[] = [];

        const chunks = await this.splitter.splitText(
            this.metadata.text.replace(/\n{3,}/g, '\n\n'),
        );

        let i = 0;

        for (const text of chunks) {
            docs.push(
                new Document({
                    id: new UUID().toString(),
                    pageContent: text,
                    metadata: {
                        ...this.metadata,
                        chunkIndex: i++, // 🔥 important
                    },
                }),
            );
        }

        return docs;
    }
}
