import { Db, MongoClient } from "mongodb";
import { container, inject, singleton } from "tsyringe"
import { Service } from "../utils/abstract/service.abstract.js";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token.js";
import { CollectionSetup } from "src/data/utils/types/collection-setup.js";
import { createUserCollection } from "src/data/collections/user.collection.js";
import { createEventLogCollection } from "src/data/collections/event.collection.js";
import { createBoardCollection } from "src/data/collections/board.collection.js";
import { env } from "src/shared/utils/constants/env.js";
import { App } from "src/App.js";


@singleton()
export class MongoService extends Service {
    client: MongoClient = new MongoClient(env.mongo.connStr, {});
    db: Db = this.client.db();
    collectionSetups: CollectionSetup[] = [
        createUserCollection,
        createEventLogCollection,
        createBoardCollection
    ];
    
    async initialize(): Promise<void> {
        await this.client.connect();
        await this.createCollections();
        App.logger.info("MongoDB connection established.")
    }

    async cleanup(): Promise<void> {
        await this.client.close();
        App.logger.info(`MongoDB connection cleaned up.`);
    }

    async reset(): Promise<void> {
        // Remove collections.
        let collections = await this.db.collections();
        for(let c of collections) {
            await c.drop();
        }
    }

    private async createCollections() {
        for (let setup of this.collectionSetups) {
            await setup(this.db);
        }
    }
}