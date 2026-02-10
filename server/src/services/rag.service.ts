import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import {
    Index,
    Pinecone,
    PineconeRecord,
    RecordMetadata,
    ServerlessSpec,
} from '@pinecone-database/pinecone';
import { CreateIndexSpec } from '@pinecone-database/pinecone/dist/control';
import { CohereClient } from 'cohere-ai';
import OpenAI from 'openai';
import { EmbeddingModel } from 'src/controllers/util/model.enum.js';
import { App } from 'src/core/App.js';
import { RepoChat } from 'src/database/entities/repo-chat/repo-chat.js';
import {
    RepoMessage,
    RepoMessageInsert,
} from 'src/database/entities/repo-message/repo-message.js';
import { ChatStatus } from 'src/database/shared/constants/chat-status.enum.js';
import { SetupRagIndex } from 'src/integrations/ragIndex.js';
import { DependencyInjectionToken } from 'src/shared/constants/dependency-injection-token.js';
import { env } from 'src/shared/constants/env.js';
import { RAGPipeline } from 'src/shared/utils/build-rag-pipeline.js';
import { container, inject, singleton } from 'tsyringe';
import { MongoService } from './mongo.service.js';
import { Service } from './shared/abstract/service.abstract.js';
import { GithubFileScrapeEntry } from './shared/classes/github-scrape-entry.js';
import { RagRunnableProperties } from './shared/constants/rag-runnable-props.js';
import { RagRunnableParameters } from './shared/interfaces/rag-runnable-params.js';
import { PineconeUtility } from './shared/utils/pinecone-utility.js';
import { scrapeGithubRepo } from './shared/utils/scrape-github-repo.js';
@singleton()
export class RagService extends Service {
    chunkPrefix: string = 'webbed-chunk';
    ragIndexName: string = env.pinecone.ragIndexName;
    ragIndex: Index<RecordMetadata>;

    pinecone: Pinecone;
    openai: OpenAI;
    cohere: CohereClient;

    constructor(@inject(MongoService) private mongo: MongoService) {
        super();
    }

    async initialize(): Promise<void> {
        this.pinecone = container.resolve(DependencyInjectionToken.Pinecone);
        this.openai = container.resolve(DependencyInjectionToken.OpenAI);
        this.cohere = container.resolve(DependencyInjectionToken.Cohere);

        // Check if Pinecone RAG index already exists.
        let currIndexes = await this.pinecone.listIndexes();
        let indexNameSet = new Set(currIndexes.indexes.map((i) => i.name));
        if (!indexNameSet.has(env.pinecone.ragIndexName)) {
            App.logger.info(
                'Pinecone RAG index does not yet exist. Establishing...',
            );
            await this.pinecone.createIndex({
                name: env.pinecone.ragIndexName,
                dimension: 1536,
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: env.pinecone.cloud,
                        region: env.pinecone.region,
                    } as ServerlessSpec,
                } as CreateIndexSpec,
                waitUntilReady: true,
            });
            App.logger.info('Pinecone RAG index established.');
        } else {
            App.logger.info('Pinecone RAG already exists.');
        }

        this.ragIndex = this.pinecone.index(this.ragIndexName);
        await SetupRagIndex(this.ragIndex); // Inject index into tsyringe container.
    }

    public async prepareGithubRepoChat(chat: RepoChat): Promise<void> {
        // Create namespace for chat.
        // If it already exists, clear.
        let namespaceId = chat._id.toString();
        let index = this.ragIndex.namespace(namespaceId);
        if (await PineconeUtility.namespaceExists(namespaceId)) {
            await index.deleteAll();
        }

        // Begin processing Github repo.
        const entries: GithubFileScrapeEntry[] = await scrapeGithubRepo(
            new URL(chat.repoUrl),
        );
        if (!!entries) {
            for (let entry of entries) {
                let chunks = await entry.chunk();

                // Generate embeddings per chunk and insert into Pinecone.
                let records = await Promise.all(
                    chunks.map(async (c) => {
                        let denseEmbeddings = (
                            await this.openai.embeddings.create({
                                input: c.pageContent,
                                model: EmbeddingModel.openai,
                            })
                        ).data[0].embedding;

                        // TO-DO:
                        /*
                        // Add BM25 vectorizer algorithm
                        // Fit based on `corpus` - doc collection
                        // Generate sparse embeddings and attach to record
                        */

                        // Associate metadata.
                        return {
                            id: `${this.chunkPrefix}#${c.id}`,
                            values: denseEmbeddings,
                            metadata: {
                                text: c.pageContent,
                                ...c.metadata,
                            },
                        } as PineconeRecord;
                    }),
                );

                if (!!records && records.length > 0) {
                    await index.upsert(records);
                }
            }
        }

        // Update library's scrape status.
        await this.mongo.collections.repoChat.updateOne(
            {
                _id: chat._id,
            },
            {
                $set: {
                    status: ChatStatus.READY,
                },
            },
        );
    }

    public async sendMessageToGithubRepoChat(
        message: RepoMessage,
    ): Promise<void> {
        // Retrieve chat and build its RAG pipeline.
        let chat = await this.mongo.collections.repoChat.findOne({
            _id: message.chatId,
        });
        const namespaceId = chat._id.toString();
        const index = await this.ragIndex.namespace(namespaceId);
        let pipeline = await RAGPipeline.build(this.openai, this.cohere, index);

        // Grab history from db.
        function convertChatsToLangchainMsgs(
            messages: RepoMessage[],
        ): BaseMessage[] {
            return messages.map((m) => {
                switch (m.source) {
                    case 'user':
                        return new HumanMessage(m.content);
                    case 'ai':
                        return new AIMessage(m.content);
                }
            });
        }
        const history = await this.mongo.collections.repoMessage
            .find({
                chatId: chat._id,
            })
            .sort({ date: 1 }) // ASC (oldest → newest)
            .toArray();
        let langchainHistory = convertChatsToLangchainMsgs(history);

        // Invoke pipeline.
        let res: RagRunnableParameters = await pipeline.invoke({
            [RagRunnableProperties.input]: message.content,
            [RagRunnableProperties.history]: langchainHistory,
        } as RagRunnableParameters);

        // Save response into DB.
        const aiResponse: RepoMessageInsert = {
            chatId: chat._id,
            source: 'ai',
            content: res[RagRunnableProperties.output],
            loading: false,
            date: new Date(),
        };
        await this.mongo.collections.repoMessage.insertOne(aiResponse);
    }
}
