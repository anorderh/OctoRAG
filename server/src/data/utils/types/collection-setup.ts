import { Db } from "mongodb";

export type CollectionSetup = (db: Db) => Promise<void>;