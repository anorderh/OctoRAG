import { Collection, Db, MongoClient } from "mongodb";
import { container, inject, singleton } from "tsyringe"
import { Service } from "../utils/abstract/service.abstract.js";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token.js";
import { CollectionSetup } from "src/data/utils/types/collection-setup.js";
import { createUserCollection, User } from "src/data/collections/user.collection.js";
import { env } from "src/shared/utils/constants/env.js";
import { App } from "src/App.js";
import { createLibraryCollection, Library } from "src/data/collections/library.collection.js";
import { createResourceCollection, Resource } from "src/data/collections/resource.collection.js";
import { createOnlineResourceCollection, OnlineResource } from "src/data/collections/online-resource.collection.js";
import { createScrapeCollection, Scrape } from "src/data/collections/scrape.collection.js";
import { createSessionCollection, Session } from "src/data/collections/session.collection.js";
import { Chat, createChatCollection } from "src/data/collections/chat.collection.js";


@singleton()
export class MongoService extends Service {
    client: MongoClient = new MongoClient(env.mongo.connStr, {});
    db: Db = this.client.db();
    collections: {
        users: Collection<User>
        library: Collection<Library>,
        resource: Collection<Resource>,
        onlineResource: Collection<OnlineResource>
        scrape: Collection<Scrape>,
        session: Collection<Session>,
        chat: Collection<Chat>
    };
    
    async initialize(): Promise<void> {
        await this.client.connect();
        App.logger.info("MongoDB connection established.")
        
        // Create collections.
        this.collections = {
            users: await createUserCollection(this.db),
            library: await createLibraryCollection(this.db),
            resource: await createResourceCollection(this.db),
            onlineResource: await createOnlineResourceCollection(this.db),
            scrape: await createScrapeCollection(this.db),
            session: await createSessionCollection(this.db),
            chat: await createChatCollection(this.db)
        }
        App.logger.info("MongoDB collections instantiated.")
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
}