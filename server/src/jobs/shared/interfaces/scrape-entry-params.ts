export interface ScrapeEntryParams<T> {
    id: string;
    body: string;
    metadata?: T;
}
