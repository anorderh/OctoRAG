import { PineconeRecord } from '@pinecone-database/pinecone';
import { GithubFileMetadata } from 'src/services/shared/classes/github-scrape-entry';

export interface OctoragPineconeRecord extends PineconeRecord {
    metadata: GithubFileMetadata;
}
