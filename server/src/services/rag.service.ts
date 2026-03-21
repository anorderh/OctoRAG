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
import { extractKeywordsFromCode } from 'src/shared/utils/extract-keywords-from-code.js';
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
            await this.mongo.submitLog(
                `Starting repo preparation...`,
                chat._id,
            );
            await this.mongo.updateStatus(chat._id, ChatStatus.PREPARING);

            const namespaceId = chat._id.toString();

            await this.mongo.submitLog(`Initializing namespace...`, chat._id);
            await this.mongo.updateStatus(
                chat._id,
                ChatStatus.INITIALIZING_NAMESPACE,
            );

            const index = this.ragIndex.namespace(namespaceId);

            if (await PineconeUtility.namespaceExists(namespaceId)) {
                await this.mongo.submitLog(
                    `Existing namespace found, clearing...`,
                    chat._id,
                );

                await this.mongo.updateStatus(
                    chat._id,
                    ChatStatus.CLEARING_NAMESPACE,
                );

                await index.deleteAll();
            }

            await this.mongo.submitLog(`Scraping repository...`, chat._id);
            await this.mongo.updateStatus(
                chat._id,
                ChatStatus.SCRAPING_REPOSITORY,
            );

            const entries: GithubFileScrapeEntry[] = await scrapeGithubRepo(
                new URL(chat.repoUrl),
                this.mongo,
                chat,
            );

            await this.mongo.submitLog(
                `Scraped ${entries?.length ?? 0} files.`,
                chat._id,
            );

            await this.mongo.updateStatus(chat._id, ChatStatus.CHUNKING_FILES);

            const fileLimit = pLimit(6);
            const chunkLimit = pLimit(3);

            const contextualizeViaLLM = RunnableSequence.from([
                ChatPromptTemplate.fromMessages([
                    ['system', RAGPipeline.prompts.contextualizeEmbedding],
                    [
                        'human',
                        `
<file>
{filepath}
</file>

<chunk>
{pageContent}
</chunk>
`,
                    ],
                ]),
                RAGPipeline.llm,
                new StringOutputParser(),
            ]);

            if (!!entries) {
                await Promise.all(
                    entries.map((entry) =>
                        fileLimit(async () => {
                            const chunks = await entry.chunk();
                            if (chunks.length === 0) return;

                            await this.mongo.submitLog(
                                `File "${entry.metadata.filepath}" → ${chunks.length} chunks`,
                                chat._id,
                            );

                            await this.mongo.updateStatus(
                                chat._id,
                                ChatStatus.GENERATING_EMBEDDINGS,
                            );

                            const keywordSets = chunks.map((c) =>
                                extractKeywordsFromCode(c.pageContent, {
                                    maxKeywords: 25,
                                    filepath: c.metadata.filepath,
                                }),
                            );
                            const embeddingInputs = chunks.map(
                                (c, i) => `
FILE: ${c.metadata.filepath}

KEYWORDS:
${(keywordSets[i] ?? []).join(', ')}

CODE:
${c.pageContent}
`,
                            );
                            const embeddingResponse =
                                await this.openai.embeddings.create({
                                    input: embeddingInputs,
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
                                        filename: c.metadata.filename,
                                        filepath: c.metadata.filepath,
                                        repoName: c.metadata.repoName,
                                        ext: c.metadata.ext,
                                    },
                                }),
                            );

                            if (records.length > 0) {
                                await this.mongo.submitLog(
                                    `Upserting ${records.length} embeddings...`,
                                    chat._id,
                                );

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

            await this.mongo.submitLog(`Repository ready.`, chat._id);
            await this.mongo.updateStatus(chat._id, ChatStatus.READY);
        } catch (err) {
            await this.mongo.submitLog(`Preparation failed.`, chat._id);
            await this.mongo.updateStatus(chat._id, ChatStatus.ERROR);
            throw err;
        }
    }

    public async sendMessageToGithubRepoChat(
        message: RepoMessage,
    ): Promise<void> {
        try {
            await this.mongo.submitLog(
                `Received user message.`,
                message.chatId,
            );

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

            await this.mongo.submitLog(`Building RAG pipeline...`, chat._id);

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

            await this.mongo.submitLog(`Fetching chat history...`, chat._id);

            const history = (
                await this.mongo.collections.repoMessage
                    .find({ chatId: chat._id })
                    .sort({ date: 1 })
                    .toArray()
            ).filter((m) => m._id !== result.insertedId); // Don't consider message in progress.

            await this.mongo.submitLog(
                `History length: ${history.length}`,
                chat._id,
            );

            const langchainHistory: BaseMessage[] = history.map((m) => {
                switch (m.source) {
                    case 'user':
                        return new HumanMessage(m.content ?? '');
                    case 'ai':
                        return new AIMessage(m.content ?? '');
                }
            });

            await this.mongo.submitLog(`Invoking pipeline...`, chat._id);

            const stream = await pipeline.stream({
                [RagRunnableProperties.input]: message.content,
                [RagRunnableProperties.history]: langchainHistory,
            } as RagRunnableParameters);

            let full = '';

            for await (const chunk of stream) {
                const token = chunk.content ?? '';
                if (!token) continue;
                full += token;
                await this.mongo.collections.repoMessage.updateOne(
                    { _id: aiResponseId },
                    {
                        $set: {
                            content: full,
                            loading: true,
                        },
                    },
                );
            }

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
            await this.mongo.submitLog(`Message cycle complete.`, chat._id);
        } catch (err) {
            await this.mongo.submitLog(
                `Message handling failed.`,
                message.chatId,
            );
            await this.mongo.updateStatus(message.chatId, ChatStatus.ERROR);
            throw err;
        }
    }
}
