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
import { DependencyInjectionToken } from 'src/shared/constants/dependency-injection-token.js';
import { env } from 'src/shared/constants/env.js';
import { OctoragPineconeRecord } from 'src/shared/interfaces/octorag-pinecone-record.js';
import { RAGPipeline } from 'src/shared/utils/rag-pipeline.js';
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
                        await this.mongo.submitLog(
                            `Chunking file "${entry.metadata.filepath}"...`,
                            chat._id,
                        );
                        const chunks = await entry.chunk();
                        await this.mongo.submitLog(
                            `${chunks.length} chunks generated for "${entry.metadata.filepath}".`,
                            chat._id,
                        );
                        if (chunks.length === 0) {
                            await this.mongo.submitLog(
                                `No chunks produced, skipping file...`,
                                chat._id,
                            );
                            return; // skip instead of break
                        }

                        // Contextualize file via LLM.
                        await this.mongo.submitLog(
                            `Contextualizing chunks for ${entry.metadata.filepath}...`,
                            chat._id,
                        );
                        const chunkLimit = pLimit(4);
                        await Promise.all(
                            chunks.map((c) =>
                                chunkLimit(async () => {
                                    await this.mongo.submitLog(
                                        `Generating context for chunk ${c.id}`,
                                        chat._id,
                                    );
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
                                    await this.mongo.submitLog(
                                        `Context generated for chunk #${c.id}\n"${context}"`,
                                        chat._id,
                                    );
                                }),
                            ),
                        );
                        await this.mongo.submitLog(
                            `Finished generating context for file ${entry.metadata.filepath}\n"`,
                            chat._id,
                        );

                        // Generate embeddings for contextualized chunks.
                        await this.mongo.submitLog(
                            `Vectorizing ${chunks.length} chunks into embeddings for "${entry.metadata.filepath}"...`,
                            chat._id,
                        );
                        await this.mongo.submitLog(
                            `Model Details:\nEmbedding Model: ${EmbeddingModel.openai}\nBM25 Vectorizer Algorithm: SKIPPED`,
                            chat._id,
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
                            await this.mongo.submitLog(
                                `${records.length} valid Pinecone records produced, inserting into Pinecone index...`,
                                chat._id,
                            );

                            await index.upsert(records);

                            await this.mongo.submitLog(
                                `${records.length} records inserted into Pinecone index!`,
                                chat._id,
                            );
                        }
                    }),
                ),
            );
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
        function convertMessagesToLangchainMsgs(
            messages: RepoMessage[],
        ): BaseMessage[] {
            return messages.map((m) => {
                switch (m.source) {
                    case 'user':
                        return new HumanMessage(m.content ?? '');
                    case 'ai':
                        return new AIMessage(m.content ?? '');
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
        let langchainHistory = convertMessagesToLangchainMsgs(history);

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
            `RAG Pipeline generated a response!`,
            chat._id,
        );
        await this.mongo.submitLog(`Output: "${aiResponseContent}"`, chat._id);

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

        // Update chat's properties.
        await this.mongo.submitLog(`Updating Chat's status...`, chat._id);
        await this.mongo.collections.repoChat.updateOne(
            { _id: message.chatId },
            {
                $set: {
                    status: ChatStatus.READY,
                    lastMessageDate: new Date(),
                },
                $inc: {
                    messageCount: 1,
                },
            },
        );
        await this.mongo.submitLog(`Updated Chat's status.`, chat._id);
    }
}
