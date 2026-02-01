import { Index, RecordMetadata } from '@pinecone-database/pinecone';
import { Library } from 'src/database/collections/library.collection';
import { Scrape } from 'src/database/collections/scrape.collection';
import { Session } from 'src/database/collections/session.collection';

export interface RagPipelineParameters {
    index: Index<RecordMetadata>;
    library: Library;
    scrape: Scrape;
    session: Session;
}
