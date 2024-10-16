import { singleton, inject, delay, container } from "tsyringe";
import { FailedGitRepoDownloadError, InvalidFindLinkFormatError, InvalidRagSessionRequest, UnsupportedFindTypeError } from '../../error-handling/errors.js';
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
import { Board, Find } from "src/data/collections/board.collection.js";
import { BoardUtility } from "src/shared/utils/classes/board.util.js";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token.js";
import { env } from "src/shared/utils/constants/env.js";
import { CollectionId } from "src/data/utils/constants/collection-id.js";
import { executeMongoChecks } from "src/shared/utils/helpers/mongo-checks.js";
import { isValidBoard } from "src/data/validation/boards/is-valid-board.js";
import { formatRecordAsDocument } from "src/shared/utils/helpers/format-record-as-document.js";
import { instantiate } from "src/dependencies/utils/extensions/instantiate.js";
import { App } from "src/App.js";
import bm25Vectorizer from "wink-nlp";
import { CohereClient } from "cohere-ai";
import { query, response } from "express";
import { HostScrape } from "src/scraping/host-scrape.js";
import { formatDocumentsAsContext } from "src/shared/utils/helpers/format-document-as-context.js";

export interface RagSession {
    sessionId: string;
    boardId: ObjectId;
    namespaceId: string;
    userId: ObjectId;
    history: BaseMessage[];
    chain: Runnable;
}

export interface CreateSessionRequest {
    boardId: ObjectId;
    userId?: ObjectId;
}

export interface ChatRequest {
    sessionId: string;
    input: string;
}

export interface CloseSessionRequest {
    sessionId: string;
}

export enum RagSessionProperties {
    input = 'input',
    history = 'history',
    interpretation = 'interpretation',
    documents = 'documents',
    context = 'context',
    output = 'output',
}

export interface RagSessionParameters {
    [RagSessionProperties.input]?: string;
    [RagSessionProperties.history]?: BaseMessage[];
    [RagSessionProperties.interpretation]?: string;
    [RagSessionProperties.documents]?: Document[];
    [RagSessionProperties.context]?: string;
    [RagSessionProperties.output]?: string;
}

// FIX: Use HTTP for this service, but it may transition into real-time functionality via Socket.io.
@singleton()
export class RagService extends Service {
    pinecone: Pinecone;
    openai: OpenAI;
    cohere: CohereClient;

    sessionsDict: {[id: string]: RagSession}
    boardCollection: Collection<Board>;
    llm: ChatOpenAI;
    ragIndex: Index<RecordMetadata>;
    embeddings: OpenAIEmbeddings;

    ragIndexName: string;

    private generateNamespaceId(board: Board) {
        let v = BoardUtility.getMostRecentVersion(board);
        return JSON.stringify({
            boardId: board._id.toString(),
            versionId: v._id.toString()
        })
    }
    private filterIndexByNamespace(id: string) {
        return this.ragIndex.namespace(id);
    }

    constructor(
        @inject(MongoService) private mongo: MongoService,
    ) {
        super();
        this.ragIndexName = env.pinecone.ragIndexName;

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
        this.pinecone = container.resolve(DependencyInjectionToken.Pinecone);
        this.openai = container.resolve(DependencyInjectionToken.OpenAI);
        this.cohere = container.resolve(DependencyInjectionToken.Cohere);

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
            App.logger.info("Pinecone RAG index does not yet exist. Establishing...")
            await this.pinecone.createIndex({
                name: env.pinecone.ragIndexName,
                dimension: env.openai.embeddingModel.dimensions,
                metric: "cosine",
                spec: spec,
                waitUntilReady: true,
            });
            App.logger.info("Pinecone RAG index established.")
        } else {
            App.logger.info("Pinecone RAG already exists.")
        }
        this.ragIndex = this.pinecone.index(this.ragIndexName);
    }

    async cleanup(): Promise<void> {
        for(let id of Object.keys(this.sessionsDict)) {
            delete this.sessionsDict[id];
        }
        await this.pinecone.deleteIndex(this.ragIndexName);
        App.logger.info("Pinecone RAG index deleted.")
    }

    public async createSession(req: CreateSessionRequest) {
        // Grab requested board.
        let board = await this.boardCollection.findOne({
            _id: req.boardId
        }).then(executeMongoChecks<Board>(isValidBoard));

        // Instantiate and store session.
        const namespaceId = this.generateNamespaceId(board);
        const index = await this.filterIndexByNamespace(namespaceId);
        const chain = await this.createLangchainPipeline(index);
        let session = {
            sessionId: new UUID().toString(),
            namespaceId: this.generateNamespaceId(board),
            boardId: req.boardId,
            userId: req.userId,
            history: [],
            chain: chain
        } as RagSession;
        this.sessionsDict[session.sessionId] = session;

        // Ensure board's associated namespace exists.
        let indexStats = await this.ragIndex.describeIndexStats();
        let currNamespaceIds = new Set(
            Object.keys(indexStats.namespaces ?? [])
        )
        if (!currNamespaceIds.has(namespaceId)) {
            await this.createNamespaceForBoard(namespaceId, board);
        }
        
        return {
            sessionId: session.sessionId,
            boardId: session.boardId
        };
    }

    public async closeSession(req: CloseSessionRequest) {
        // Delete namespace and all records held.
        let currSession = this.sessionsDict[req.sessionId];
        let index = await this.filterIndexByNamespace(currSession.namespaceId);
        await index.deleteAll();
        delete this.sessionsDict[req.sessionId];
    }

    public async chat(req: ChatRequest) {
        let currSession = this.sessionsDict[req.sessionId];
        if (currSession == null) {
            throw new InvalidRagSessionRequest();
        };

        let res : RagSessionParameters = await currSession.chain.invoke({
            [RagSessionProperties.input]: req.input,
            [RagSessionProperties.history]: currSession.history
        } as RagSessionParameters);
        currSession.history.push(new HumanMessage(res[RagSessionProperties.input]));
        currSession.history.push(new AIMessage(res[RagSessionProperties.output]));

        return res;
    }

    private async createLangchainPipeline(index: Index) {
        // Consider session's chat history.
        const considerHistory = new RunnablePassthrough().assign({
            [RagSessionProperties.interpretation]: (parameters: RagSessionParameters) => {
                let history = parameters[RagSessionProperties.history];
                if (!!history && history.length > 0) {
                    return RunnableSequence.from([
                        ChatPromptTemplate.fromMessages([
                            ["system", `\
Given a chat history and the latest user question \
which might reference context in the chat history, formulate a standalone \
question which can be understood without the chat history. Do NOT answer the \
question, just reformulate it if needed and otherwise return it as is.
` ],
                            new MessagesPlaceholder(RagSessionProperties.history),
                            ["human", `{${RagSessionProperties.input}}`]
                        ]),
                        this.llm,
                        new StringOutputParser(),
                    ])
                } else {
                    return parameters[RagSessionProperties.input];
                }
            },
        })

        const applyRag = new RunnablePassthrough().assign({
            [RagSessionProperties.documents]: RunnableSequence.from([
                async (parameters: RagSessionParameters) => {
                    const queryDenseEmbeddings = (await this.openai.embeddings.create({
                        input: parameters[RagSessionProperties.interpretation],
                        model: env.openai.embeddingModel.name
                    })).data[0].embedding;
        
                    // Apply BM25 sparse embedding search here later.
                    // Though this will prob shift to Python cloud func, keep it in mind.
        
                    let res = await index.query({
                        vector: queryDenseEmbeddings,
                        topK: 20,
                        includeMetadata: true
                    });
                    let records: ScoredPineconeRecord[] = res.matches;
                    return records;
                },
                formatRecordAsDocument
            ])
        })

        const contextualizeDocuments = new RunnablePassthrough().assign({
            [RagSessionProperties.documents]: async (parameters: RagSessionParameters) => {
                let docs = parameters[RagSessionProperties.documents];
                let tasks = docs.map((d: Document) => {
                    return new Promise<void>(async (resolve, reject) => {
                        try {
                            let runnable = RunnableSequence.from([
                                ChatPromptTemplate.fromMessages([
                                    ["system", `\
<metadata>
{metadata}
</metadata>
Here is the chunk we want to situate within the source, provided its metadata.
<chunk>
{pageContent}
</chunk>

Please give a short succinct context to situate this chunk within the source, using its metadata, for the purposes of improving search retrieval of the chunk.
Answer only with the succinct context and nothing else.
`]
                                ]),
                                this.llm,
                                new StringOutputParser()
                            ]);
                            let chunkContext = await runnable.invoke(d);
                            d.pageContent = `${chunkContext}; "${d.pageContent}"`
                            resolve();
                        } catch (err) {
                            reject(err)
                        }
                    });
                })
                await Promise.all(tasks);
                return docs;
            }
        });

        const rerankDocuments = new RunnablePassthrough().assign({
            [RagSessionProperties.documents]: async (parameters: RagSessionParameters) => {
                let query = parameters[RagSessionProperties.interpretation];
                let docs = parameters[RagSessionProperties.documents];

                let rawDocContent = docs.map(d => d.pageContent);
                let res = await this.cohere.rerank({
                    query: query,
                    model: "rerank-english-v2.0",
                    documents: rawDocContent,
                    topN: 20
                })
                let rerankedDocs = res.results.map(r => docs[r.index])

                return rerankedDocs
            }
        })

        const queryLLM = RunnableSequence.from([
            new RunnablePassthrough().assign({
                [RagSessionProperties.context]: (parameters: RagSessionParameters) => {
                    let docs = parameters[RagSessionProperties.documents];
                    return formatDocumentsAsContext(docs);
                },
            }),
            new RunnablePassthrough().assign({
                [RagSessionProperties.output]: RunnableSequence.from([
                    ChatPromptTemplate.fromMessages([
                        ["system", `\
You are an assistant for question-answering tasks. \
Use the following pieces of retrieved context to answer the question. \
If you don't know the answer, just say that you don't know. \
Use three sentences maximum and keep the answer concise. \
\n\n{context}`],
                        new MessagesPlaceholder(RagSessionProperties.history),
                        ["human", `{${RagSessionProperties.interpretation}}`],
                    ]),
                    this.llm,
                    new StringOutputParser(),
                ])
            })
        ]);
                
        // Build final chain.
        const chain = RunnableSequence.from([
            considerHistory,
            applyRag,
            contextualizeDocuments,
            rerankDocuments,
            queryLLM
        ])

        return chain;
    }

    private async createNamespaceForBoard(namespaceId: string, board: Board) {
        // Grab relevant entities & infrastructure.     
        let mostRecentVersion = BoardUtility.getMostRecentVersion(board);
        let index = this.filterIndexByNamespace(namespaceId);
        let batchSize = env.defaults.chunking.batchSize;

        // Process over finds.
        for(let f of mostRecentVersion.finds) {
            let scrape = new HostScrape(f);
            let entries = await scrape.scrape();

            // Insert each entry's chunks into Pinecone db.
            for (let entry of entries) {
                let chunks = await entry.chunk();
                let records = await this.createPineconeRecords(chunks);
                await index.upsert(records);
            }

            // // Batch load into Pinecone db.
            // for (let i = 0; i < scrape.chunks.length; i += batchSize) {
            //     let batch = scrape.chunks.slice(i, i + batchSize);
            //     let records = await this.createPineconeRecords(batch);
            //     await index.upsert(records);
            // }
        };
    }

    private async createPineconeRecords(chunks: Document<Record<string, any>>[]) {
        let chunkPrefix = "webbed-chunk";
        // Add BM25 vectorizer algorithm
        // Fit based on `corpus` - doc collection
        // Generate sparse embeddings and attach to record

        let records = await Promise.all(chunks.map(async (c) => {
            // Generate embeddings.
            let denseEmbeddings = (await this.openai.embeddings.create({
                input: c.pageContent,
                model: env.openai.embeddingModel.name
            })).data[0].embedding;

            // Associate metadata.
            return {
                id: `${chunkPrefix}#${c.id}`,
                values: denseEmbeddings,
                metadata: {
                    'text': c.pageContent, // You NEED to define 'text' to perform RAG.
                    ...c.metadata
                }
            } as PineconeRecord
        }))
        return records;
    }
}