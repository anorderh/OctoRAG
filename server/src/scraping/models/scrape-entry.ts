import { ChunkType } from "src/utils/enums/chunk-type";
import { FindType } from "src/utils/enums/find-type";

export interface ScrapeMetadata {
    type: FindType
}

export interface ScrapeEntry<T extends ScrapeMetadata> {
    id: string;
    body: string;
    chunkType?: ChunkType;
    metadata?: T;
}