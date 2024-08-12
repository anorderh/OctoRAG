import { Db, MongoClient } from "mongodb";
import { env } from "../env";
import { container, inject, singleton } from "tsyringe"
import { createBoardCollection, createEventLogCollection, createUserCollection } from "../data/collections";
import { InstanceDeps } from "../utils/enums/instance-deps";
import pino, { Logger } from "pino";
import { EnsureDep } from "../routing/decorators/ensure-dep";
import { AsyncService } from "../utils/abstract/async-service";

@singleton()
@EnsureDep(InstanceDeps.Logger)
export class MongoService implements AsyncService {
    client: MongoClient = new MongoClient(env.mongo.connStr);
    db: Db = this.client.db();
    collectionSetupArr: Function[] = [
        createUserCollection,
        createBoardCollection,
        createEventLogCollection
    ]

    constructor(
        @inject(InstanceDeps.Logger) private logger: Logger,
    ) {}
    
    async initialize(): Promise<void> {
        try {
            await this.client.connect();
            this.createCollections();

            this.logger.info("MongoDB connection established.")
        } catch(err) {
            this.logger.error("MongoDB connection failed.")
        }
    }
    async cleanup(): Promise<void> {
        await this.client.close();
        this.logger.info(`MongoDB connection cleaned up.`);
    }

    private createCollections() {
        this.collectionSetupArr.forEach((setup) => {
            setup(this.db!);
        })
    }
}