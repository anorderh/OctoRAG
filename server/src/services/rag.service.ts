import { singleton, inject, delay } from "tsyringe";
import { FindType } from '../utils/enums/find-type';
import { FailedGitRepoDownloadError, InvalidFindLinkFormatError, InvalidRagSessionRequest, UnsupportedFindTypeError } from '../error-handling/errors';
import { Logger } from "pino";
import { InstanceDeps } from '../utils/enums/instance-deps';
import axios, { AxiosInstance, AxiosResponse } from "axios";
import {YoutubeTranscript} from 'youtube-transcript';
import * as cheerio from 'cheerio';
import { env } from '../env';
import { decode } from "html-entities";
import * as fs from 'fs';
import { Collection, ObjectId, UUID } from "mongodb";
import yauzl from 'yauzl';
import { streamToString } from '../utils/extensions/stream-to-str';
import AdmZip from "adm-zip";
import { downloadFile } from '../utils/extensions/download-file';
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { Index, Pinecone, PineconeRecord, RecordMetadata, ServerlessSpec } from "@pinecone-database/pinecone";
import { CreateIndexRequestMetricEnum, ServerlessSpecCloudEnum, ServerlessSpecFromJSON } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/control";
import { CreateIndexSpec } from "@pinecone-database/pinecone/dist/control";
import OpenAI from 'openai';
import { Board } from "src/data/collections";
import { MongoService } from "./mongo.service";
import { CollectionId } from "src/utils/enums/collection-id";
import { executeMongoChecks } from "src/utils/extensions/mongo-checks";
import { isValidBoard } from "src/utils/validation/board";
import { ScrapeService } from "./scrape.service";
import { ScrapeResult } from "src/utils/interfaces/scrape-result";
import { withTimeout } from "src/utils/extensions/with-timeout";
import { Document, BaseDocumentTransformer } from "@langchain/core/documents";
import { AIMessage, AIMessageChunk, HumanMessage } from "@langchain/core/messages";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Runnable, RunnableBinding, RunnableMap, RunnablePassthrough, RunnableSequence, RunnableWithMessageHistory } from "@langchain/core/runnables";
import { BaseChatMessageHistory } from "@langchain/core/dist/chat_history";
import { ChatMessageHistory } from "langchain/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { AsyncService } from "src/utils/abstract/async-service";
import { BoardHelpers } from "src/utils/extensions/board-helpers";
import { EnsureDep } from "src/routing/decorators/ensure-dep";
import { instancedDependencies } from "src/dependencies";
import { index } from "cheerio/dist/commonjs/api/traversing";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";

export interface RagSession {
    id: string;
    status: RagSessionStatus;
    boardId: ObjectId;
    namespaceId: string;
    // FIX: Chat history is currently stored in memory. Probably want to change that.
    history: BaseChatMessageHistory
    userId?: ObjectId;
    // FIX: Should session chains be persisted in memory?
    chain?: Runnable<any>;
}

export interface RagSessionReadModel {
    id: string;
    boardId: ObjectId;
    userId?: ObjectId;
}

export enum RagSessionStatus {
    STARTING,
    ACTIVE,
    CLOSING,
    STALLED
}

export interface CreateSessionRequest {
    boardId: ObjectId;
    userId?: ObjectId;
}

export interface CloseSessionRequest {
    sessionId: string;
}

export interface ChatRequest {
    sessionId: string;
    input: string;
}

export interface ChatResponse {
    input: string;
    answer: string;
    history: string[]
}

// FIX: Use HTTP for this service, but it may transition into real-time functionality via Socket.io.
@singleton()
@EnsureDep([
    InstanceDeps.OpenAI,
    InstanceDeps.Pinecone
])
export class RagService extends AsyncService {
    sessionsDict: {[id: string]: RagSession}
    boardCollection: Collection<Board>;
    llm: ChatOpenAI;
    ragIndex: Index<RecordMetadata>;
    embeddings: OpenAIEmbeddings;

    ragIndexName: string;
    inputMessagesKey: string;
    historyMessagesKey: string;
    contextMessagesKey: string;
    outputMessagesKey: string;

    private generateNamespaceId(board: Board) {
        let v = BoardHelpers.getMostRecentVersion(board);
        return JSON.stringify({
            boardId: board._id.toString(),
            versionId: v._id.toString()
        })
    }
    private filterIndexByNamespace(id: string) {
        return this.ragIndex.namespace(id);
    }

    constructor(
        @inject(InstanceDeps.OpenAI) private openai: OpenAI,
        @inject(InstanceDeps.Pinecone) private pinecone: Pinecone,
        @inject(MongoService) private mongo: MongoService,
        @inject(ScrapeService) private scrapeService: ScrapeService,
        @inject(InstanceDeps.Logger) private logger: Logger,
    ) {
        super();
        this.ragIndexName = env.pinecone.ragIndexName;
        this.inputMessagesKey = "input";
        this.historyMessagesKey = "chat_history";
        this.contextMessagesKey = "context";
        this.outputMessagesKey = "answer";

        this.llm = new ChatOpenAI({
            model: env.openai.llmModel.name,
            temperature: 0
        });
        this.embeddings = new OpenAIEmbeddings({
            model: env.openai.embeddingModel.name
        });
        this.sessionsDict = {};
        this.boardCollection = this.mongo.db.collection(CollectionId.Board);
    }

    async initialize(): Promise<void> {
        let spec = {
            serverless: {
                cloud: env.pinecone.cloud,
                region: env.pinecone.region
            } as ServerlessSpec
        } as CreateIndexSpec;

        // Check if Pinecone RAG index already exists.
        let currIndexes = await this.pinecone.listIndexes();
        let indexNameSet = new Set(currIndexes.indexes.map(i => i.name));
        if (!indexNameSet.has(env.pinecone.ragIndexName)) {
            this.logger.info("Pinecone RAG index does not yet exist. Establishing...")
            await this.pinecone.createIndex({
                name: env.pinecone.ragIndexName,
                dimension: env.openai.embeddingModel.dimensions,
                metric: "cosine",
                spec: spec,
                waitUntilReady: true,
            });
            this.logger.info("Pinecone RAG index established.")
        } else {
            this.logger.info("Pinecone RAG already exists.")
        }
        this.ragIndex = this.pinecone.index(this.ragIndexName);
    }

    async cleanup(): Promise<void> {
        for(let id of Object.keys(this.sessionsDict)) {
            delete this.sessionsDict[id];
        }
        await this.pinecone.deleteIndex(this.ragIndexName);
        this.logger.info("Pinecone RAG index deleted.")
    }

    public async createSession(req: CreateSessionRequest) : Promise<RagSessionReadModel> {
        // Grab requested board.
        let board = await this.boardCollection.findOne({
            _id: req.boardId
        }).then(executeMongoChecks<Board>(isValidBoard));

        // Instantiate and store session.
        let namespaceId = this.generateNamespaceId(board);
        let session = {
            id: new UUID().toString(),
            status: RagSessionStatus.STARTING,
            namespaceId: this.generateNamespaceId(board),
            boardId: req.boardId,
            userId: req.userId,
            history: new ChatMessageHistory()
        } as RagSession;
        this.sessionsDict[session.id] = session;

        // Ensure board's associated namespace exists.
        let indexStats = await this.ragIndex.describeIndexStats();
        let currNamespaceIds = new Set(
            Object.keys(indexStats.namespaces ?? [])
        )
        if (!currNamespaceIds.has(namespaceId)) {
            await this.createNamespaceForBoard(namespaceId, board);
        }
        
        // Create Langchain pipeline, unique to session.
        session.chain = await this.createLangchainPipeline(session);

        // Activate session and return info.
        session.status = RagSessionStatus.ACTIVE
        return {
            id: session.id,
            boardId: session.boardId,
            userId: session.userId
        } as RagSessionReadModel
    }

    public async closeSession(req: CloseSessionRequest) {
        // Mark board as 'closing' (an attempt to signal other sessions not to use).
        let currSession = this.sessionsDict[req.sessionId];
        currSession.status = RagSessionStatus.CLOSING;

        // Delete namespace and all records held.
        let index = await this.filterIndexByNamespace(currSession.namespaceId);
        await index.deleteAll();
        delete this.sessionsDict[req.sessionId];
    }

    public async chat(req: ChatRequest) {
        let currSession = this.sessionsDict[req.sessionId];
        if (currSession == null) {
            throw new InvalidRagSessionRequest();
        } else if (currSession.status == RagSessionStatus.STARTING) {
            throw new InvalidRagSessionRequest({body: "Session is not yet able to receive chat messages."})
        }

        let res = (await currSession.chain.invoke({
            [this.inputMessagesKey]: req.input,
        }, {
            configurable: {
                sessionId: currSession.id
            }
        }));
        let baseMessages = await currSession.history.getMessages();
        let history = baseMessages.map(bm => bm.content);

        return {
            input: req.input,
            context: res[this.contextMessagesKey],
            answer: res[this.outputMessagesKey].content,
            history: history
        } as ChatResponse;
    }

    private async createLangchainPipeline(session: RagSession) {
        // Instantiate OpenAI, Langchain, and Pinecone dependencies.
        const index = await this.filterIndexByNamespace(session.namespaceId);
        const vectorStore = await PineconeStore.fromExistingIndex(this.embeddings, {
            pineconeIndex: index,
            namespace: session.namespaceId, // Vector store requires namespace specified, regardless of index's namespace.
            maxConcurrency: 5 // Max number of concurrent calls.
        });
        const retriever = vectorStore.asRetriever();

        // https://js.langchain.com/v0.2/docs/how_to/qa_chat_history_how_to/.
        // Create contextualize chain for modifying input, if chat history is present.
        const contextualizeQSysPrompt = `Given a chat history and the latest user question \
which might reference context in the chat history, formulate a standalone \
question which can be understood without the chat history. Do NOT answer the \
question, just reformulate it if needed and otherwise return it as is.`;
        const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
            ["system", contextualizeQSysPrompt ],
            new MessagesPlaceholder(this.historyMessagesKey),
            ["human", `{${this.inputMessagesKey}}`]
        ]);
        const contextualizeQChain = contextualizeQPrompt
            .pipe(this.llm)
            .pipe(new StringOutputParser());

        // Make RAG Document retrieval affected by new input, if applicable.
        const contextualizedQuestion = (input: Record<string, unknown>) : Runnable<any> => {
            let history = input[this.historyMessagesKey];
            if (!!history) {
                return contextualizeQChain;
            }
            return new RunnablePassthrough().bind(input[this.inputMessagesKey])
        };

        // Ensure that only info from the documents provided is utilizied.
        const qaSystemPrompt = `You are an assistant for question-answering tasks. \
Use the following pieces of retrieved context to answer the question. \
If you don't know the answer, just say that you don't know. \
Use three sentences maximum and keep the answer concise. \
\n\n{context}`;
        const qaPrompt = ChatPromptTemplate.fromMessages([
            ["system", qaSystemPrompt],
            new MessagesPlaceholder(this.historyMessagesKey),
            ["human", `{${this.inputMessagesKey}}`],
        ]);

        // Dictate the response objects format.
        //      contextMessagesKey - Most relevant docs pulled.
        //      outputMessagesKey - RunnableSequence output.
        const ragChain = new RunnablePassthrough()
            .assign({
                [this.contextMessagesKey]: (input: Record<string, unknown>) => {
                    return contextualizedQuestion(input)
                        .pipe(retriever)
                        .pipe(formatDocumentsAsString)
                },
            })
            .assign({
                [this.outputMessagesKey]: RunnableSequence.from([
                    qaPrompt,
                    this.llm,
                ])
            });

        // Utilize message history wrapper, so that `historyMessagesKey` is properly distributed
        // and that in-memory ChatMessageHistory is updated per invocation.
        let conversationalRagChain = new RunnableWithMessageHistory({
            runnable: ragChain,
            getMessageHistory: () => {
                return session.history
            },
            inputMessagesKey: this.inputMessagesKey,
            historyMessagesKey: this.historyMessagesKey,
            outputMessagesKey: this.outputMessagesKey
        });
        
        return conversationalRagChain
    }

    private async createNamespaceForBoard(namespaceId: string, board: Board) {            
        // Scrape most recent version's finds.
        let mostRecentVersion = BoardHelpers.getMostRecentVersion(board);
        let scrapes: ScrapeResult[] = [];
        for(let f of mostRecentVersion.finds) {
            let res = await this.scrapeService.scrape(f);
            scrapes = scrapes.concat(res)
        };

        // Load scrapes into vector index.
        let index = this.filterIndexByNamespace(namespaceId)
        let batchSize = env.defaults.chunking.batchSize;
        for (let s of scrapes) {
            // Chunk scrape content.
            let chunks = await this.generateChunks(s.text);

            // Transform chunks into records and batch load.
            for (let i = 0; i < chunks.length; i += batchSize) {
                let batch = chunks.slice(i, i + batchSize);
                let records = await this.buildPineconeRecords(batch, s);
                await index.upsert(records);
            }
        }
    }

    private async generateChunks(input: string, chunkSize?: number, chunkOverlap?: number) {
        let splitter = new RecursiveCharacterTextSplitter({
            chunkSize: chunkSize ?? env.defaults.chunking.chunkSize,
            chunkOverlap: chunkOverlap ?? env.defaults.chunking.chunkOverlap
        });
        let chunks = await splitter.createDocuments([input]);

        return chunks;
    }

    private async buildPineconeRecords(chunks: Document<Record<string, any>>[], scrape: ScrapeResult) {
        let chunkPrefix = "webbed";
        let records = await Promise.all(chunks.map(async (c) => {
            // Generate embeddings.
            let embeddings = (await this.openai.embeddings.create({
                input: c.pageContent,
                model: env.openai.embeddingModel.name
            })).data[0].embedding;

            // Associate metadata.
            return {
                id: `${chunkPrefix}#${new UUID().toString()}`,
                values: embeddings,
                metadata: {
                    doi: scrape.doi,
                    source: scrape.source,
                    subgroup: scrape.subgroup,
                    text: c.pageContent,
                }
            } as PineconeRecord
        }))

        return records;
    }
}