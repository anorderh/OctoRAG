import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { Library } from "src/data/collections/library.collection";
import { Scrape } from "src/data/collections/scrape.collection";
import { Session } from "src/data/collections/session.collection";

export interface RagPipelineParameters {
    index: Index<RecordMetadata>;
    library: Library;
    scrape: Scrape;
    session: Session;
}