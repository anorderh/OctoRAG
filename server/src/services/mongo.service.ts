import { Db, MongoClient } from "mongodb";
import { env } from '../env.js';
import { container, inject, singleton } from "tsyringe"
import { createBoardCollection, createEventLogCollection, createUserCollection } from '../data/collections/index.js';
import { InstanceDeps } from '../utils/enums/instance-deps.js';
import pino, { Logger, P } from "pino";
import { AsyncService } from '../utils/abstract/async-service.js';
import { CollectionId } from '../utils/enums/collection-id.js';
import { CollectionSetup } from '../utils/types/collection-setup.js';
import { EnsureDep } from '../routing/decorators/ensure-dep.js';

@singleton()
@EnsureDep(InstanceDeps.Logger)
export class MongoService implements AsyncService {
    client: MongoClient = new MongoClient(env.mongo.connStr, {});
    db: Db = this.client.db();
    collectionSetups: CollectionSetup[] = [
        createUserCollection,
        createEventLogCollection,
        createBoardCollection
    ];

    constructor(
        @inject(InstanceDeps.Logger) private logger: Logger,
    ) {}
    
    async initialize(): Promise<void> {
        await this.client.connect();
        this.createCollections();
        this.logger.info("MongoDB connection established.")
    }

    async cleanup(): Promise<void> {
        await this.client.close();
        this.logger.info(`MongoDB connection cleaned up.`);
    }

    async reset(): Promise<void> {
        // Remove collections.
        let collections = await this.db.collections();
        for(let c of collections) {
            await c.drop();
        }
    }

    private createCollections() {
        for (let setup of this.collectionSetups) {
            setup(this.db);
        }
    }
}