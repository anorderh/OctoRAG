import { TextSplitter } from "langchain/text_splitter";
import { ScrapeMetadata } from "../interfaces/scrape-metadata";
import { Document } from "@langchain/core/documents";
import { ScrapeEntryParams } from "../interfaces/scrape-entry-params";

export abstract class ScrapeEntry<T extends ScrapeMetadata> {
    splitter?: TextSplitter;

    id: string;
    body: string;
    metadata?: T;

    constructor({id, body, metadata}: ScrapeEntryParams) {
        this.id = id;
        this.body = body;
        this.metadata = metadata;
    }

    abstract chunk(): Promise<Document<Record<string, any>>[]>;
}