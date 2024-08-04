import { Db, MongoClient } from "mongodb";
import { env } from "../env";
import { inject, singleton } from "tsyringe"
import { LogService } from "./log.service";
import { createBoardCollection, createEventCollection, createUserCollection } from "../data/collections";

singleton()
export class MongoService {
    client: MongoClient;
    db: Db;
    collectionSetupArr: Function[] = [
        createUserCollection,
        createBoardCollection,
        createEventCollection
    ]

    constructor(
        @inject(LogService) private logService: LogService,
    ) {}
    
    async initialize(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                this.client = new MongoClient(env.mongo.connStr);
                await this.client.connect();
                this.db = this.client.db();
                this.createCollections();

                this.logService.info("MongoDB connection established.")
                resolve();
            } catch(err) {
                this.logService.error("MongoDB connection failed.")
                reject();
            }
        })
    }

    private createCollections() {
        this.collectionSetupArr.forEach((setup) => {
            setup(this.db!);
        })
    }
}