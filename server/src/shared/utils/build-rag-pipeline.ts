import { Document } from '@langchain/core/documents';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from '@langchain/core/prompts';
import {
    RunnablePassthrough,
    RunnableSequence,
} from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import {
    Index,
    RecordMetadata,
    ScoredPineconeRecord,
} from '@pinecone-database/pinecone';
import { CohereClient } from 'cohere-ai';
import OpenAI from 'openai';
import { EmbeddingModel, LlmModel } from 'src/controllers/util/model.enum';
import { RepoChat } from 'src/database/entities/repo-chat/repo-chat';
import { MongoService } from 'src/services/mongo.service';
import { RagRunnableProperties } from 'src/services/shared/constants/rag-runnable-props.js';
import { RagRunnableParameters } from 'src/services/shared/interfaces/rag-runnable-params';
import { pathes } from 'src/shared/constants/pathes.js';
import { formatDocumentsAsContext } from 'src/shared/utils/format-document-as-context.js';
import { formatRecordAsDocument } from 'src/shared/utils/format-record-as-document.js';
import { readLocalFile } from 'src/shared/utils/read-local-file.js';

export class RAGPipeline {
    public static prompts = {
        assistant: readLocalFile(`${pathes.prompts}/assistant.txt`),
        considerHistory: readLocalFile(`${pathes.prompts}/considerHistory.txt`),
        contextualizeEmbedding: readLocalFile(
            `${pathes.prompts}/contextualizeEmbedding.txt`,
        ),
    };

    public static async build(
        openai: OpenAI,
        cohere: CohereClient,
        chatsPineconeIndex: Index<RecordMetadata>,
        mongo: MongoService,
        chat: RepoChat,
    ): Promise<RunnableSequence> {
        const modelTemperature = 0;
        await mongo.submitLog(
            `Model Details:\nLLM Model: ${LlmModel.openai}\nTemperature: ${modelTemperature}`,
            chat._id,
        );
        const llm = new ChatOpenAI({
            model: LlmModel.openai,
            temperature: modelTemperature,
        });
        await mongo.submitLog(`OpenAI client instantiated.`, chat._id);

        await mongo.submitLog(
            `Creating runnable "considerHistory", to reinterpret message based on chat history.`,
            chat._id,
        );
        // Consider session's chat history.
        const considerHistory = new RunnablePassthrough().assign({
            [RagRunnableProperties.interpretation]: async (
                parameters: RagRunnableParameters,
            ) => {
                let history = parameters[RagRunnableProperties.history];
                await mongo.submitLog(
                    `STEP 1 - HISTORY-AWARE REINTERPRETATION OF USER INPUT...`,
                    chat._id,
                );
                if (!!history && history.length > 0) {
                    await mongo.submitLog(
                        `Previous messages found, piping into OpenAI to reinterpret.`,
                        chat._id,
                    );
                    return RunnableSequence.from([
                        ChatPromptTemplate.fromMessages([
                            ['system', this.prompts.considerHistory],
                            new MessagesPlaceholder(
                                RagRunnableProperties.history,
                            ),
                            ['human', `{${RagRunnableProperties.input}}`],
                        ]),
                        llm,
                        new StringOutputParser(),
                    ]);
                } else {
                    await mongo.submitLog(
                        `No previous messages found, no reinterpretation generated.`,
                        chat._id,
                    );
                    return parameters[RagRunnableProperties.input];
                }
            },
        });

        await mongo.submitLog(
            `Creating runnable "applyRag", to vectorize the new interpretation into an embedding.`,
            chat._id,
        );
        const applyRag = new RunnablePassthrough().assign({
            [RagRunnableProperties.documents]: RunnableSequence.from([
                async (parameters: RagRunnableParameters) => {
                    await mongo.submitLog(
                        `STEP 2 - VECTORIZE INPUT INTO EMBEDDINGS AND RETRIEVE DOCUMENTS FROM PINECONE...`,
                        chat._id,
                    );
                    const queryDenseEmbeddings = (
                        await openai.embeddings.create({
                            input: parameters[
                                RagRunnableProperties.interpretation
                            ],
                            model: EmbeddingModel.openai,
                        })
                    ).data[0].embedding;
                    await mongo.submitLog(`Embedding generated.`, chat._id);
                    await mongo.submitLog(
                        `Preview: ${queryDenseEmbeddings.toString().slice(0, 50)}.`,
                        chat._id,
                    );

                    // Apply BM25 sparse embedding search here later.
                    // Though this will prob shift to Python cloud func, keep it in mind.
                    await mongo.submitLog(
                        `Using re-interpretation embedding to query most relevant Pinecord records.`,
                        chat._id,
                    );
                    let res = await chatsPineconeIndex.query({
                        vector: queryDenseEmbeddings,
                        topK: 20,
                        includeMetadata: true,
                    });
                    let records: ScoredPineconeRecord[] = res.matches;
                    await mongo.submitLog(
                        `${records.length} Pinecone records matched!`,
                        chat._id,
                    );
                    return records;
                },
                formatRecordAsDocument,
            ]),
        });

        await mongo.submitLog(
            `Creating runnable "contextualizeDocuments", for the LLM to contextualize the chunks' context based on chunk metadata.`,
            chat._id,
        );
        const contextualizeDocuments = new RunnablePassthrough().assign({
            [RagRunnableProperties.documents]: async (
                parameters: RagRunnableParameters,
            ) => {
                await mongo.submitLog(
                    `STEP 3 - INTERPRET METADATA TO GENERATE CONTEXT FOR RETRIEVED DOCUMENTS, I.E. "CONTEXTUALIZED RETRIEVAL"...`,
                    chat._id,
                );
                let docs = parameters[RagRunnableProperties.documents];
                let tasks = docs.map((d: Document) => {
                    return new Promise<void>(async (resolve, reject) => {
                        try {
                            let runnable = RunnableSequence.from([
                                ChatPromptTemplate.fromMessages([
                                    [
                                        'system',
                                        this.prompts.contextualizeEmbedding,
                                    ],
                                ]),
                                llm,
                                new StringOutputParser(),
                            ]);
                            let chunkContext = await runnable.invoke(d);
                            await mongo.submitLog(
                                `Context generated for Document ${d.id}:`,
                                chat._id,
                            );
                            await mongo.submitLog(
                                `Document ID#${d.id} Preview: ${chunkContext.slice(0, 50)}`,
                                chat._id,
                            );
                            d.pageContent = `${chunkContext}; "${d.pageContent}"`;
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    });
                });
                await Promise.all(tasks);
                return docs;
            },
        });

        await mongo.submitLog(
            `Creating runnable "rerankDocuments", for reorder produced documents based on chunk contexts.`,
            chat._id,
        );
        const rerankDocuments = new RunnablePassthrough().assign({
            [RagRunnableProperties.documents]: async (
                parameters: RagRunnableParameters,
            ) => {
                let query = parameters[RagRunnableProperties.interpretation];
                let docs = parameters[RagRunnableProperties.documents];
                let rawDocContent = docs.map((d) => d.pageContent);

                await mongo.submitLog(
                    `STEP 4 - RERANK DOCUMENTS VIA COHERE, EMPHASIZING VECTOR SIMILARITY AND TO USER QUERY...`,
                    chat._id,
                );
                await mongo.submitLog(
                    `Re-ranking existing document order: ${docs.map((d, idx) => `${idx + 1}:${d.id}`).join(', ')}...`,
                    chat._id,
                );
                let res = await cohere.rerank({
                    query: query,
                    model: 'rerank-english-v3.0',
                    documents: rawDocContent,
                    topN: 20,
                });
                let rerankedDocs = res.results.map((r) => docs[r.index]);
                await mongo.submitLog(
                    `Documents re-ranked: ${rerankedDocs.map((d, idx) => `${idx + 1}:${d.id}`).join(', ')}...`,
                    chat._id,
                );

                return rerankedDocs;
            },
        });

        await mongo.submitLog(
            `Creating runnable "queryLLM", to ask LLM to answer message's re-interpretation with matched, contextualized, and reranked documents as context.`,
            chat._id,
        );
        const queryLLM = RunnableSequence.from([
            new RunnablePassthrough().assign({
                [RagRunnableProperties.context]: async (
                    parameters: RagRunnableParameters,
                ) => {
                    const docs = parameters[RagRunnableProperties.documents];
                    const context = formatDocumentsAsContext(docs);
                    await mongo.submitLog(
                        `Context Preview: ${context.slice(0, 200)}...`,
                        chat._id,
                    );
                    return context;
                },
            }),
            async (parameters: RagRunnableParameters) => {
                await mongo.submitLog(
                    `STEP 5 - INVOKING LLM WITH COMBINED INTERPRETATION, CHAT HISTORY, AND CONTEXTUALIZED RAG CHUNKS...`,
                    chat._id,
                );
                await mongo.submitLog(
                    `User interpretation: ${parameters[RagRunnableProperties.interpretation]}`,
                    chat._id,
                );
                await mongo.submitLog(
                    `History length: ${parameters[RagRunnableProperties.history]?.length ?? 0}`,
                    chat._id,
                );
                return parameters;
            },
            new RunnablePassthrough().assign({
                [RagRunnableProperties.output]: RunnableSequence.from([
                    ChatPromptTemplate.fromMessages([
                        ['system', this.prompts.assistant],
                        new MessagesPlaceholder(RagRunnableProperties.history),
                        ['human', `{${RagRunnableProperties.interpretation}}`],
                    ]),
                    llm,
                    new StringOutputParser(),
                ]),
            }),
        ]);

        // Build final chain.
        const chain = RunnableSequence.from([
            considerHistory,
            applyRag,
            contextualizeDocuments,
            rerankDocuments,
            queryLLM,
        ]);
        await mongo.submitLog(
            `LangChain RunnableSequence constructed.`,
            chat._id,
        );

        return chain;
    }
}
