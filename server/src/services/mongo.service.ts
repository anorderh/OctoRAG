import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import { App } from 'src/core/App.js';
import { createRepoChatCollection } from 'src/database/collections/repo-chat.collection.js';
import { createRepoLogCollection } from 'src/database/collections/repo-log.collection.js';
import { createRepoMessageCollection } from 'src/database/collections/repo-message.collection.js';
import { createUserCollection } from 'src/database/collections/user-collection.js';
import { RepoChatEntity } from 'src/database/entities/repo-chat/repo-chat.js';
import { RepoLogEntity } from 'src/database/entities/repo-log/repo-log.js';
import { RepoMessageEntity } from 'src/database/entities/repo-message/repo-message.js';
import { UserEntity } from 'src/database/entities/user/user.js';
import { env } from 'src/shared/constants/env.js';
import { singleton } from 'tsyringe';
import { Service } from './shared/abstract/service.abstract.js';

@singleton()
export class MongoService extends Service {
    client: MongoClient = new MongoClient(env.mongo.connStr, {});
    db: Db = this.client.db();
    collections: {
        repoChat: Collection<RepoChatEntity>;
        repoMessage: Collection<RepoMessageEntity>;
        repoLog: Collection<RepoLogEntity>;
        user: Collection<UserEntity>;
    };

    async initialize(): Promise<void> {
        await this.client.connect();
        App.logger.info('MongoDB connection established.');

        // Create collections.
        this.collections = {
            repoChat: await createRepoChatCollection(this.db),
            repoMessage: await createRepoMessageCollection(this.db),
            repoLog: await createRepoLogCollection(this.db),
            user: await createUserCollection(this.db),
        };
        App.logger.info('MongoDB collections instantiated.');
    }

    public async submitLog(content: string, chatId: ObjectId): Promise<void> {
        const newLog: RepoLogEntity = {
            chatId,
            date: new Date(),
            content,
        };
        await this.collections.repoLog.insertOne(newLog);
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
