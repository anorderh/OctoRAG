import { Collection, Db } from "mongodb";

export type CollectionSetup<T> = (db: Db) => Promise<Collection<T>>;