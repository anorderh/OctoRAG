import { Db, MongoClient } from "mongodb";
import { container, inject, singleton } from "tsyringe"
import { Service } from "../utils/abstract/service.abstract.js";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token.js";
import { CollectionSetup } from "src/data/utils/types/collection-setup.js";
import { createUserCollection } from "src/data/collections/user.collection.js";
import { env } from "src/shared/utils/constants/env.js";
import { App } from "src/App.js";
import { createLibraryCollection } from "src/data/collections/library.collection.js";
import { createResourceCollection } from "src/data/collections/resource.collection.js";
import { createOnlineResourceCollection } from "src/data/collections/online-resource.collection.js";
import { createScrapeCollection } from "src/data/collections/scrape.collection.js";
import { createSessionCollection } from "src/data/collections/session.collection.js";
import { createChatCollection } from "src/data/collections/chat.collection.js";


@singleton()
export class MongoService extends Service {
    client: MongoClient = new MongoClient(env.mongo.connStr, {});
    db: Db = this.client.db();
    collectionSetups: CollectionSetup[] = [
        createUserCollection,
        createLibraryCollection,
        createResourceCollection,
        createOnlineResourceCollection,
        createScrapeCollection,
        createSessionCollection,
        createChatCollection
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