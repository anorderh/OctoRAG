import { Collection, Db, MongoClient } from 'mongodb';
import { App } from 'src/App.js';
import {
    Chat,
    createChatCollection,
} from 'src/database/collections/chat.collection.js';
import {
    createLibraryCollection,
    Library,
} from 'src/database/collections/library.collection.js';
import {
    createOnlineResourceCollection,
    OnlineResource,
} from 'src/database/collections/online-resource.collection.js';
import {
    createResourceCollection,
    Resource,
} from 'src/database/collections/resource.collection.js';
import {
    createScrapeCollection,
    Scrape,
} from 'src/database/collections/scrape.collection.js';
import {
    createSessionCollection,
    Session,
} from 'src/database/collections/session.collection.js';
import {
    createUserCollection,
    User,
} from 'src/database/collections/user.collection.js';
import { env } from 'src/shared/constants/env.js';
import { singleton } from 'tsyringe';
import { Service } from './shared/abstract/service.abstract.js';

@singleton()
export class MongoService extends Service {
    client: MongoClient = new MongoClient(env.mongo.connStr, {});
    db: Db = this.client.db();
    collections: {
        users: Collection<User>;
        library: Collection<Library>;
        resource: Collection<Resource>;
        onlineResource: Collection<OnlineResource>;
        scrape: Collection<Scrape>;
        session: Collection<Session>;
        chat: Collection<Chat>;
    };

    async initialize(): Promise<void> {
        await this.client.connect();
        App.logger.info('MongoDB connection established.');

        // Create collections.
        this.collections = {
            users: await createUserCollection(this.db),
            library: await createLibraryCollection(this.db),
            resource: await createResourceCollection(this.db),
            onlineResource: await createOnlineResourceCollection(this.db),
            scrape: await createScrapeCollection(this.db),
            session: await createSessionCollection(this.db),
            chat: await createChatCollection(this.db),
        };
        App.logger.info('MongoDB collections instantiated.');
    }

    async cleanup(): Promise<void> {
        await this.client.close();
        App.logger.info(`MongoDB connection cleaned up.`);
    }

    async reset(): Promise<void> {
        // Remove collections.
        let collections = await this.db.collections();
        for (let c of collections) {
            await c.drop();
        }
    }
}
