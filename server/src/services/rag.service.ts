import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import {
    Index,
    Pinecone,
    RecordMetadata,
    ServerlessSpec,
} from '@pinecone-database/pinecone';
import { CreateIndexSpec } from '@pinecone-database/pinecone/dist/control';
import { CohereClient } from 'cohere-ai';
import OpenAI from 'openai';
import pLimit from 'p-limit';
import { EmbeddingModel } from 'src/controllers/util/model.enum.js';
import { App } from 'src/core/App.js';
import { RepoChat } from 'src/database/entities/repo-chat/repo-chat.js';
import {
    RepoMessage,
    RepoMessageEntity,
} from 'src/database/entities/repo-message/repo-message.js';
import { ChatStatus } from 'src/database/shared/constants/chat-status.enum.js';
import { SetupRagIndex } from 'src/integrations/ragIndex.js';
import { RagRunnableProperties } from 'src/services/shared/constants/rag-runnable-props.js';
import { RagRunnableParameters } from 'src/services/shared/interfaces/rag-runnable-params.js';
import { DependencyInjectionToken } from 'src/shared/constants/dependency-injection-token.js';
import { env } from 'src/shared/constants/env.js';
import { OctoragPineconeRecord } from 'src/shared/interfaces/octorag-pinecone-record.js';
import { RAGPipeline } from 'src/shared/utils/rag-pipeline.js';
import { container, inject, singleton } from 'tsyringe';
import { MongoService } from './mongo.service.js';
import { Service } from './shared/abstract/service.abstract.js';
import { GithubFileScrapeEntry } from './shared/classes/github-scrape-entry.js';
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

        let currIndexes = await this.pinecone.listIndexes();
        let indexNameSet = new Set(currIndexes.indexes.map((i) => i.name));

        if (!indexNameSet.has(env.pinecone.ragIndexName)) {
            App.logger.info('Creating Pinecone index...');
            await this.pinecone.createIndex({
                name: env.pinecone.ragIndexName,
                dimension: 3072,
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: env.pinecone.cloud,
                        region: env.pinecone.region,
                    } as ServerlessSpec,
                } as CreateIndexSpec,
                waitUntilReady: true,
            });
        }

        this.ragIndex = this.pinecone.index(this.ragIndexName);
        await SetupRagIndex(this.ragIndex);
    }

    public async prepareGithubRepoChat(chat: RepoChat): Promise<void> {
        try {
            await this.mongo.updateStatus(chat._id, ChatStatus.PREPARING);

            const namespaceId = chat._id.toString();

            await this.mongo.updateStatus(
                chat._id,
                ChatStatus.INITIALIZING_NAMESPACE,
            );

            const index = this.ragIndex.namespace(namespaceId);

            if (await PineconeUtility.namespaceExists(namespaceId)) {
                await this.mongo.updateStatus(
                    chat._id,
                    ChatStatus.CLEARING_NAMESPACE,
                );
                await index.deleteAll();
            }

            await this.mongo.updateStatus(
                chat._id,
                ChatStatus.SCRAPING_REPOSITORY,
            );

            const entries: GithubFileScrapeEntry[] = await scrapeGithubRepo(
                new URL(chat.repoUrl),
                this.mongo,
                chat,
            );

            await this.mongo.updateStatus(chat._id, ChatStatus.CHUNKING_FILES);

            if (!!entries) {
                const contextualizeViaLLM = RunnableSequence.from([
                    ChatPromptTemplate.fromMessages([
                        ['system', RAGPipeline.prompts.contextualizeEmbedding],
                        [
                            'human',
                            `
<metadata>
{metadata}
</metadata>

<chunk>
{pageContent}
</chunk>
`,
                        ],
                    ]),
                    RAGPipeline.llm,
                    new StringOutputParser(),
                ]);

                const fileLimit = pLimit(8);

                await Promise.all(
                    entries.map((entry) =>
                        fileLimit(async () => {
                            const chunks = await entry.chunk();
                            if (chunks.length === 0) return;

                            await this.mongo.updateStatus(
                                chat._id,
                                ChatStatus.CONTEXTUALIZING_CHUNKS,
                            );

                            const chunkLimit = pLimit(4);

                            await Promise.all(
                                chunks.map((c) =>
                                    chunkLimit(async () => {
                                        const context =
                                            await contextualizeViaLLM.invoke({
                                                metadata: JSON.stringify(
                                                    entry.metadata,
                                                    null,
                                                    2,
                                                ),
                                                pageContent: c.pageContent,
                                            });

                                        c.metadata.contextSummary = context;
                                    }),
                                ),
                            );

                            await this.mongo.updateStatus(
                                chat._id,
                                ChatStatus.GENERATING_EMBEDDINGS,
                            );

                            const embeddingResponse =
                                await this.openai.embeddings.create({
                                    input: chunks.map(
                                        (c) =>
                                            `CONTEXT: ${c.metadata.contextSummary}\n\nTEXT: ${c.pageContent}`,
                                    ),
                                    model: EmbeddingModel.openai,
                                });

                            const embeddings = embeddingResponse.data.map(
                                (d) => d.embedding,
                            );

                            const records: OctoragPineconeRecord[] = chunks.map(
                                (c, idx) => ({
                                    id: `${this.chunkPrefix}#${c.id}`,
                                    values: embeddings[idx],
                                    metadata: {
                                        text: c.pageContent,
                                        context: c.metadata.contextSummary,
                                        filepath: c.metadata.filepath,
                                        repoName: c.metadata.repoName,
                                        ext: c.metadata.ext,
                                    },
                                }),
                            );

                            if (records.length > 0) {
                                await this.mongo.updateStatus(
                                    chat._id,
                                    ChatStatus.UPSERTING_VECTORS,
                                );

                                await index.upsert(records);
                            }
                        }),
                    ),
                );
            }

            await this.mongo.updateStatus(chat._id, ChatStatus.READY);
        } catch (err) {
            await this.mongo.updateStatus(chat._id, ChatStatus.ERROR);
            throw err;
        }
    }

    public async sendMessageToGithubRepoChat(
        message: RepoMessage,
    ): Promise<void> {
        try {
            await this.mongo.updateStatus(
                message.chatId,
                ChatStatus.RECEIVED_MESSAGE,
            );

            const chat = await this.mongo.collections.repoChat.findOne({
                _id: message.chatId,
            });

            const aiResponse: RepoMessageEntity = {
                chatId: message.chatId,
                source: 'ai',
                loading: true,
                date: new Date(),
            };

            const result =
                await this.mongo.collections.repoMessage.insertOne(aiResponse);

            const aiResponseId = result.insertedId;

            await this.mongo.updateStatus(
                chat._id,
                ChatStatus.BUILDING_PIPELINE,
            );

            const namespaceId = chat._id.toString();
            const index = this.ragIndex.namespace(namespaceId);

            const pipeline = await RAGPipeline.build(
                this.openai,
                this.cohere,
                index,
                this.mongo,
                chat,
            );

            const history = await this.mongo.collections.repoMessage
                .find({ chatId: chat._id })
                .sort({ date: 1 })
                .toArray();

            const langchainHistory: BaseMessage[] = history.map((m) => {
                switch (m.source) {
                    case 'user':
                        return new HumanMessage(m.content ?? '');
                    case 'ai':
                        return new AIMessage(m.content ?? '');
                }
            });

            const res: RagRunnableParameters = await pipeline.invoke({
                [RagRunnableProperties.input]: message.content,
                [RagRunnableProperties.history]: langchainHistory,
            } as RagRunnableParameters);

            const aiResponseContent = res[RagRunnableProperties.output];

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

            await this.mongo.updateStatus(chat._id, ChatStatus.READY);

            await this.mongo.collections.repoChat.updateOne(
                { _id: message.chatId },
                {
                    $set: {
                        lastMessageDate: new Date(),
                    },
                    $inc: {
                        messageCount: 1,
                    },
                },
            );
        } catch (err) {
            await this.mongo.updateStatus(message.chatId, ChatStatus.ERROR);
            throw err;
        }
    }
}
