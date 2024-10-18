import { singleton, inject, delay, container } from "tsyringe";
import { FailedGitRepoDownloadError, InvalidURLFormatError, InvalidRagSessionRequest } from '../../error-handling/errors.js';
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
import { RagRunnableParameters } from "./utils/interfaces/rag-runnable-params.js";
import { RagRunnableProperties } from "./utils/constants/rag-runnable-props.js";
import { RagPipelineParameters } from "./utils/interfaces/rag-pipeline-params.js";

// FIX: Use HTTP for this service, but it may transition into real-time functionality via Socket.io.
@singleton()
export class PipelineService extends Service {
    ragIndex: Index<RecordMetadata>;
    pinecone: Pinecone;
    openai: OpenAI;
    cohere: CohereClient;

    constructor(
        @inject(MongoService) private mongo: MongoService,
    ) {
        super();
    }

    async initialize(): Promise<void> {
        this.pinecone = container.resolve(DependencyInjectionToken.Pinecone);
        this.openai = container.resolve(DependencyInjectionToken.OpenAI);
        this.cohere = container.resolve(DependencyInjectionToken.Cohere);
        this.ragIndex = container.resolve(DependencyInjectionToken.RagIndex);
    }

    async buildRAGPipeline({
        index,
        library,
        scrape,
        session
    }: RagPipelineParameters) : Promise<RunnableSequence> {
        const llm = new ChatOpenAI({
            model: session.llmModel,
            temperature: 0
        });
    
        // Consider session's chat history.
        const considerHistory = new RunnablePassthrough().assign({
            [RagRunnableProperties.interpretation]: (parameters: RagRunnableParameters) => {
                let history = parameters[RagRunnableProperties.history];
                if (!!history && history.length > 0) {
                    return RunnableSequence.from([
                        ChatPromptTemplate.fromMessages([
                            ["system", `\
    Given a chat history and the latest user question \
    which might reference context in the chat history, formulate a standalone \
    question which can be understood without the chat history. Do NOT answer the \
    question, just reformulate it if needed and otherwise return it as is.
    ` ],
                            new MessagesPlaceholder(RagRunnableProperties.history),
                            ["human", `{${RagRunnableProperties.input}}`]
                        ]),
                        llm,
                        new StringOutputParser(),
                    ])
                } else {
                    return parameters[RagRunnableProperties.input];
                }
            },
        })
    
        const applyRag = new RunnablePassthrough().assign({
            [RagRunnableProperties.documents]: RunnableSequence.from([
                async (parameters: RagRunnableParameters) => {
                    const queryDenseEmbeddings = (await this.openai.embeddings.create({
                        input: parameters[RagRunnableProperties.interpretation],
                        model: scrape.embeddingModel
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
            [RagRunnableProperties.documents]: async (parameters: RagRunnableParameters) => {
                let docs = parameters[RagRunnableProperties.documents];
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
                                llm,
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
            [RagRunnableProperties.documents]: async (parameters: RagRunnableParameters) => {
                let query = parameters[RagRunnableProperties.interpretation];
                let docs = parameters[RagRunnableProperties.documents];
    
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
                [RagRunnableProperties.context]: (parameters: RagRunnableParameters) => {
                    let docs = parameters[RagRunnableProperties.documents];
                    return formatDocumentsAsContext(docs);
                },
            }),
            new RunnablePassthrough().assign({
                [RagRunnableProperties.output]: RunnableSequence.from([
                    ChatPromptTemplate.fromMessages([
                        ["system", `\
You are an assistant for question-answering tasks. \
Use the following pieces of retrieved context to answer the question. \
If you don't know the answer, just say that you don't know. \
Use three to five sentences maximum and keep the answer concise. \
\n\n{context}`],
                        new MessagesPlaceholder(RagRunnableProperties.history),
                        ["human", `{${RagRunnableProperties.interpretation}}`],
                    ]),
                    llm,
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
}