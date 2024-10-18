import { singleton, inject, delay, container } from "tsyringe";
import { FailedGitRepoDownloadError, InvalidURLFormatError, InvalidRagSessionRequest, FailedNullAssertionError, MissingRAGPipelineError } from '../../error-handling/errors.js';
import { Logger } from "pino";
import { Collection, ObjectId, UUID } from "mongodb";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { Index, Pinecone, PineconeRecord, RecordMetadata, ScoredPineconeRecord, ServerlessSpec } from "@pinecone-database/pinecone";
import { CreateIndexSpec } from "@pinecone-database/pinecone/dist/control";
import OpenAI from 'openai';
import { MongoService } from "../data/mongo.service.js";
import { Document, BaseDocumentTransformer } from "@langchain/core/documents";
import { AIMessage, AIMessageChunk, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Runnable, RunnableBinding, RunnableLambda, RunnableMap, RunnablePassthrough, RunnableSequence, RunnableWithMessageHistory } from "@langchain/core/runnables";
import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import { ChatMessageHistory } from "langchain/memory";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Service } from "../utils/abstract/service.abstract.js";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token.js";
import { env } from "src/shared/utils/constants/env.js";
import { CollectionId } from "src/data/utils/constants/collection-id.js";
import { executeMongoChecks } from "src/shared/utils/helpers/mongo-checks.js";
import { formatRecordAsDocument } from "src/shared/utils/helpers/format-record-as-document.js";
import { instantiate } from "src/dependencies/utils/extensions/instantiate.js";
import { App } from "src/App.js";
import bm25Vectorizer from "wink-nlp";
import { CohereClient } from "cohere-ai";
import { query, response } from "express";
import { OnlineResourceScrape } from "src/scraping/online-resource-scrape.js";
import { formatDocumentsAsContext } from "src/shared/utils/helpers/format-document-as-context.js";
import { Library } from "src/data/collections/library.collection.js";
import { Resource } from "src/data/collections/resource.collection.js";
import { OnlineResource } from "src/data/collections/online-resource.collection.js";
import { Scrape } from "src/data/collections/scrape.collection.js";
import { Session } from "src/data/collections/session.collection.js";
import { SetupRagIndex } from "src/dependencies/injections/ragIndex.js";
import { PipelineService } from "./pipeline.service.js";
import { ScrapeLibraryParams } from "./utils/interfaces/scrape-library-params.js";
import { CreateSessionParams } from "./utils/interfaces/create-session-params.js";
import { httpContext } from "src/routing/middleware/http-context.js";
import { assert } from "src/error-handling/utils/extensions/assert.js";
import { ChatParams} from "./utils/interfaces/chat-params.js";
import { RagRunnableParameters } from "./utils/interfaces/rag-runnable-params.js";
import { RagRunnableProperties } from "./utils/constants/rag-runnable-props.js";
import { Chat } from "src/data/collections/chat.collection.js";
import { ChatType } from "src/data/utils/constants/chat-type.js";
import { PineconeUtility } from "./utils/classes/pinecone-utility.js";
import { isValidSession } from "src/data/validation/session/is-valid-session.js";
import { isValidLibrary } from "src/data/validation/library/is-valid-library.js";
import { isValidScrape } from "src/data/validation/scrape/is-valid-scrape.js";

// FIX: Use HTTP for this service, but it may transition into real-time functionality via Socket.io.
@singleton()
export class RagService extends Service {
    chunkPrefix: string = "webbed-chunk";
    ragIndexName: string = env.pinecone.ragIndexName;
    ragIndex: Index<RecordMetadata>;

    pinecone: Pinecone;
    openai: OpenAI;
    cohere: CohereClient

    constructor(
        @inject(MongoService) private mongo: MongoService,
        @inject(PipelineService) private pipeline: PipelineService
    ) {
        super();
    }

    async initialize(): Promise<void> {
        this.pinecone = container.resolve(DependencyInjectionToken.Pinecone);
        this.openai = container.resolve(DependencyInjectionToken.OpenAI);
        this.cohere = container.resolve(DependencyInjectionToken.Cohere);

        // Check if Pinecone RAG index already exists.
        let currIndexes = await this.pinecone.listIndexes();
        let indexNameSet = new Set(currIndexes.indexes.map(i => i.name));
        if (!indexNameSet.has(env.pinecone.ragIndexName)) {
            App.logger.info("Pinecone RAG index does not yet exist. Establishing...")
            await this.pinecone.createIndex({
                name: env.pinecone.ragIndexName,
                dimension: 1536,
                metric: "cosine",
                spec: {
                    serverless: {
                        cloud: env.pinecone.cloud,
                        region: env.pinecone.region
                    } as ServerlessSpec
                } as CreateIndexSpec,
                waitUntilReady: true,
            });
            App.logger.info("Pinecone RAG index established.")
        } else {
            App.logger.info("Pinecone RAG already exists.")
        }

        this.ragIndex = this.pinecone.index(this.ragIndexName);
        await SetupRagIndex(this.ragIndex); // Inject index into tsyringe container.
    }

    public async scrapeLibrary(params: ScrapeLibraryParams): Promise<Scrape> {
        let batchSize = env.defaults.chunking.batchSize;
        let library = params.library;

        // Grab library's resources.
        // TO-DO: Only online resources are implemented so far. Add resource handling later.
        let onlineResources = await this.mongo.collections.onlineResource.find({
            _libraryId: library._id
        }).toArray() as OnlineResource[];

        // Grab namespace within Pinecone. Clear if pre-existing records are present.
        let namespaceId = library._id.toString();
        let index = this.ragIndex.namespace(namespaceId);
        if (await PineconeUtility.namespaceExists(namespaceId)) {
            await index.deleteAll();
        }

        // Beging processing resources.
        for(let r of onlineResources) {
            let scrape = new OnlineResourceScrape(r);
            let entries = await scrape.scrape();

            // Chunk derived entries.
            if (!!entries) {
                for (let entry of entries) {
                    let chunks = await entry.chunk();
    
                    // Generate embeddings per chunk and insert into Pinecone.
                    let records = await Promise.all(chunks.map(async (c) => {
                        let denseEmbeddings = (await this.openai.embeddings.create({
                            input: c.pageContent,
                            model: params.embeddingModel
                        })).data[0].embedding;
    
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
                                'text': c.pageContent,
                                ...c.metadata
                            }
                        } as PineconeRecord
                    }))
    
                    if (!!records && records.length > 0) {
                        await index.upsert(records);
                    }
                }
            }

            // // Batch load into Pinecone db.
            // for (let i = 0; i < scrape.chunks.length; i += batchSize) {
            //     let batch = scrape.chunks.slice(i, i + batchSize);
            //     let records = await this.createPineconeRecords(batch);
            //     await index.upsert(records);
            // }
        };

        // Track scrape in db.
        let scrape = {
            _id: new ObjectId(),
            _libraryId: library._id,
            embeddingModel: params.embeddingModel,
            created: new Date()
        } as Scrape;
        await this.mongo.collections.scrape.insertOne(scrape);

        // Update library's scrape status.
        await this.mongo.collections.library.updateOne({
            _id: library._id
        }, {
            $set: {
                pendingScrape: false,
                lastScraped: new Date()
            }
        })

        return scrape;
    }

    public async createSession(params: CreateSessionParams): Promise<Session> {
        const library = params.library;
        let namespaceId = library._id.toString();

        // Ensure scrape exists and locate.
        let scrape: Scrape = (await this.mongo.collections.scrape.find({
            _libraryId: library._id
        }).sort({
            lastScraped: -1
        }).limit(1).toArray())[0] || null;
        if (scrape == null || params.forceNewScrape) {
            // No scrape present OR new scrape requested, create a new one.
            scrape = await this.scrapeLibrary({
                library,
                embeddingModel: assert(
                    params.embeddingModel,
                    (val: string) => {
                        if (val == null) {
                            throw new FailedNullAssertionError({
                                body: "Embedding model cannot be null"
                            })
                        }
                    }
                )
            });
        }
        
        // Create session and store in db.
        let session = {
            _id: new ObjectId(),
            namespace: namespaceId,
            llmModel: params.llmModel,
            _libraryId: library._id,
            _scrapeId: scrape._id,
            created: new Date()
        } as Session;
        await this.mongo.collections.session.insertOne(session);

        return session;
    }

    public async chat(params: ChatParams) : Promise<RagRunnableParameters> {
        // Confirm dependencies' existence.
        let session = await this.mongo.collections.session.findOne({
            _id: params._sessionId
        }).then(executeMongoChecks<Session>([
            isValidSession
        ]));
        let library = await this.mongo.collections.library.findOne({
            _id: session._libraryId
        }).then(executeMongoChecks<Library>([
            isValidLibrary
        ]));
        let scrape = await this.getLatestScrape(library._id)
            .then(executeMongoChecks<Scrape>([
                isValidScrape
            ]))
        const namespaceId = library._id.toString();
        const index = await this.ragIndex.namespace(namespaceId);
        let pipeline = await this.pipeline.buildRAGPipeline({
            index,
            library,
            scrape,
            session,
        });

        // Grab history from db.
        function convertChatsToLangchainMsgs(chats: Chat[]) : BaseMessage[] {
            let validChatTypes = [ChatType.Human, ChatType.AI];
            return chats
                .filter(c => validChatTypes.includes(c.type))
                .map(c => {
                    switch (c.type) {
                        case ChatType.Human:
                            return new HumanMessage(c.content)
                        case ChatType.AI:
                            return new AIMessage(c.content)
                    }
                })
        }
        let history = await this.mongo.collections.chat.find({
            _sessionId: session._id
        }).toArray();
        let langchainHistory = convertChatsToLangchainMsgs(history);

        // Invoke pipeline.
        let res : RagRunnableParameters = await pipeline.invoke({
            [RagRunnableProperties.input]: params.input,
            [RagRunnableProperties.history]: langchainHistory
        } as RagRunnableParameters);

        // Save new chat messages into db.
        let chats = {
            input: {
                _id: new ObjectId(),
                _sessionId: session._id,
                type: ChatType.Human,
                content: res[RagRunnableProperties.input],
                created: new Date()
            } as Chat,
            output: {
                _id: new ObjectId(),
                _sessionId: session._id,
                type: ChatType.AI,
                content: res[RagRunnableProperties.output],
                created: new Date()
            } as Chat
        }
        await this.mongo.collections.chat.insertMany([
            chats.input,
            chats.output
        ])

        return res;
    }

    public async closeSession(_sessionId: ObjectId) : Promise<void> {
        // Confirm session's existence.
        let session = await this.mongo.collections.session.findOne({
            _id: _sessionId
        }).then(executeMongoChecks<Session>([
            isValidSession
        ]));

        // Delete associated impl.
        await this.mongo.collections.session.deleteOne({ // Session entity.
            _id: session._id
        });
        // await this.mongo.collections.chat.deleteMany({ // Chat entities.
        //     _sessionId: session._id
        // })
    }

    private async getLatestScrape(_libraryId: ObjectId) : Promise<Scrape | null> {
        return (await this.mongo.collections.scrape.find({
                _libraryId: _libraryId
            }).sort({
                lastScraped: -1
            }).limit(1).toArray())[0] || null
    }
}