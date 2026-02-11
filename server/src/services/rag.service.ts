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
    RepoMessageEntity,
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
    chunkPrefix: string = 'octoRAG';
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
        // Updating Chat's status to LOADING.
        await this.mongo.submitLog(
            `Updating Chat ${chat._id.toHexString()} status...`,
            chat._id,
        );
        // Update chat's status.
        await this.mongo.collections.repoChat.updateOne(
            {
                _id: chat._id,
            },
            {
                $set: {
                    status: ChatStatus.LOADING,
                },
            },
        );
        await this.mongo.submitLog(
            `Chat ${chat._id.toHexString()}'s status has been set to loading and is unable to receive messages.`,
            chat._id,
        );

        // Create namespace for chat.
        // If it already exists, clear.
        await this.mongo.submitLog('Retrieving namespace ID...', chat._id);
        let namespaceId = chat._id.toString();
        let index = this.ragIndex.namespace(namespaceId);
        await this.mongo.submitLog(
            `Retrieved Pinecome namespace with ID ${namespaceId}`,
            chat._id,
        );
        if (await PineconeUtility.namespaceExists(namespaceId)) {
            await this.mongo.submitLog(
                `Namespace already exists, wiping existing records...`,
                chat._id,
            );
            await index.deleteAll();
            await this.mongo.submitLog(`Existing records wiped.`, chat._id);
        }

        // Begin processing Github repo.
        await this.mongo.submitLog(
            `Scraping Github repo at ${chat.repoUrl}...`,
            chat._id,
        );
        const entries: GithubFileScrapeEntry[] = await scrapeGithubRepo(
            new URL(chat.repoUrl),
            this.mongo,
            chat,
        );
        await this.mongo.submitLog(
            `Github repository at ${chat.repoUrl} scraped.`,
            chat._id,
        );
        await this.mongo.submitLog(
            `Starting chunking process for Pinecone vector db...`,
            chat._id,
        );
        if (!!entries) {
            for (let entry of entries) {
                await this.mongo.submitLog(
                    `Chunking file "${entry.metadata.filename}"...`,
                    chat._id,
                );
                let chunks = await entry.chunk();
                await this.mongo.submitLog(
                    `${chunks.length} chunks generated for "${entry.metadata.filename}".`,
                    chat._id,
                );

                await this.mongo.submitLog(
                    `Vectorizing ${chunks.length} chunks into embeddings for "${entry.metadata.filename}"...`,
                    chat._id,
                );
                await this.mongo.submitLog(
                    `Model Details:\nEmbedding Model: ${EmbeddingModel.openai}\nBM25 Vectorizer Algorithm: SKIPPED`,
                    chat._id,
                );
                // Generate embeddings per chunk and insert into Pinecone.
                let records = await Promise.all(
                    chunks.map(async (c, idx) => {
                        let denseEmbeddings = (
                            await this.openai.embeddings.create({
                                input: c.pageContent,
                                model: EmbeddingModel.openai,
                            })
                        ).data[0].embedding;
                        await this.mongo.submitLog(
                            `Embedding generated for chunk ${idx + 1}"...\n`,
                            chat._id,
                        );
                        await this.mongo.submitLog(
                            `Embedding preview: ${denseEmbeddings.toString().slice(0, 50)}`,
                            chat._id,
                        );

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

                await this.mongo.submitLog(`Checking records...`, chat._id);
                if (!!records && records.length > 0) {
                    await this.mongo.submitLog(
                        `${records.length} valid Pinecone records produced, insert into Pinecone index...`,
                        chat._id,
                    );
                    await index.upsert(records);
                    await this.mongo.submitLog(
                        `${records.length} records inserted into Pinecone index!`,
                        chat._id,
                    );
                }
            }
        }

        await this.mongo.submitLog(
            `Updating Chat ${chat._id.toHexString()} status...`,
            chat._id,
        );
        // Update chat's status.
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
        await this.mongo.submitLog(
            `Chat ${chat._id.toHexString()} is ready to receive messages.`,
            chat._id,
        );
    }

    public async sendMessageToGithubRepoChat(
        message: RepoMessage,
    ): Promise<void> {
        // Update Chat's status and retrieve entity.
        await this.mongo.collections.repoChat.updateOne(
            { _id: message.chatId },
            {
                $set: {
                    status: ChatStatus.RESPONDING,
                },
            },
        );
        const chat = await this.mongo.collections.repoChat.findOne({
            _id: message.chatId,
        });
        await this.mongo.submitLog(
            `Message received for Chat ${chat._id.toHexString()}.`,
            chat._id,
        );
        await this.mongo.submitLog(`Content: ${message.content}`, chat._id);

        // Save response to DB while processing.
        await this.mongo.submitLog(
            `Saving placeholder AI response...`,
            chat._id,
        );
        const aiResponse: RepoMessageEntity = {
            chatId: message.chatId,
            source: 'ai',
            loading: true,
            date: new Date(),
        };
        const result =
            await this.mongo.collections.repoMessage.insertOne(aiResponse);
        const aiResponseId = result.insertedId;
        await this.mongo.submitLog(
            `AI response saved with Message ID ${aiResponseId.toHexString()}`,
            chat._id,
        );

        // Build RAG pipeline.
        await this.mongo.submitLog(
            `Building RAG runnable pipeline...`,
            chat._id,
        );
        await this.mongo.submitLog(`Retrieving namespace ID...`, chat._id);
        const namespaceId = chat._id.toString();
        await this.mongo.submitLog(
            `Pinecone namespace retrieved: ${namespaceId}.`,
            chat._id,
        );
        const index = await this.ragIndex.namespace(namespaceId);
        let pipeline = await RAGPipeline.build(
            this.openai,
            this.cohere,
            index,
            this.mongo,
            chat,
        );
        await this.mongo.submitLog(`Built RAG Pipeline.`, chat._id);

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
        await this.mongo.submitLog(
            `Fetching chat history from Mongo database...`,
            chat._id,
        );
        const history = await this.mongo.collections.repoMessage
            .find({
                chatId: chat._id,
            })
            .sort({ date: 1 }) // ASC (oldest → newest)
            .toArray();
        await this.mongo.submitLog(`Fetched chat history.`, chat._id);
        let langchainHistory = convertChatsToLangchainMsgs(history);

        // Invoke pipeline.
        await this.mongo.submitLog(
            `Invoking RAG pipeline with fetched history and input message...`,
            chat._id,
        );
        let res: RagRunnableParameters = await pipeline.invoke({
            [RagRunnableProperties.input]: message.content,
            [RagRunnableProperties.history]: langchainHistory,
        } as RagRunnableParameters);
        const aiResponseContent = res[RagRunnableProperties.output];
        await this.mongo.submitLog(
            `RAG Pipeline generated a response: "${aiResponseContent}"`,
            chat._id,
        );

        // Update response with content and change status.
        await this.mongo.submitLog(`Saving AI response to MongoDB..`, chat._id);
        await this.mongo.collections.repoMessage.updateOne(
            { _id: aiResponseId },
            {
                $set: {
                    content: aiResponseContent,
                    loading: false,
                    date: new Date(),
                },
            },
        );
        await this.mongo.submitLog(`AI response saved to MongoDB..`, chat._id);

        // Update chat's status.
        await this.mongo.submitLog(`Updating Chat's status to READY`, chat._id);
        await this.mongo.collections.repoChat.updateOne(
            { _id: message.chatId },
            {
                $set: {
                    status: ChatStatus.READY,
                },
            },
        );
        await this.mongo.submitLog(`Updated Chat's status.`, chat._id);
    }
}
