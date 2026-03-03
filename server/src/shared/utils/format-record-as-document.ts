import { Document } from '@langchain/core/documents';
import { ScoredPineconeRecord } from '@pinecone-database/pinecone';
import { GithubFileMetadata } from 'src/services/shared/classes/github-scrape-entry';

export function formatRecordAsDocument(records: ScoredPineconeRecord[]) {
    return records.map((r) => {
        let pageContent = r.metadata.text;

        delete r.metadata['text'];
        let metadata = r.metadata;

        return {
            id: r.id,
            pageContent,
            metadata,
        } as Document<GithubFileMetadata>;
    });
}
