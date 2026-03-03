import { BaseMessage } from '@langchain/core/messages';
import { Document } from 'langchain/document';
import { GithubFileMetadata } from '../classes/github-scrape-entry';
import { RagRunnableProperties } from '../constants/rag-runnable-props';

export interface RagRunnableParameters {
    [RagRunnableProperties.input]?: string;
    [RagRunnableProperties.history]?: BaseMessage[];
    [RagRunnableProperties.interpretation]?: string;
    [RagRunnableProperties.documents]?: Document<GithubFileMetadata>[];
    [RagRunnableProperties.context]?: string;
    [RagRunnableProperties.output]?: string;
}
