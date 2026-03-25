import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
    RunnableLambda,
    RunnablePassthrough,
    RunnableSequence,
} from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Index, RecordMetadata } from '@pinecone-database/pinecone';
import { CohereClient } from 'cohere-ai';
import OpenAI from 'openai';
import { EmbeddingModel, LlmModel } from 'src/controllers/util/model.enum';
import { RepoChat } from 'src/database/entities/repo-chat/repo-chat';
import { ChatStatus } from 'src/database/shared/constants/chat-status.enum.js';
import { MongoService } from 'src/services/mongo.service';
import { RagRunnableProperties } from 'src/services/shared/constants/rag-runnable-props.js';
import { RagRunnableParameters } from 'src/services/shared/interfaces/rag-runnable-params';
import { pathes } from 'src/shared/constants/pathes.js';
import { formatDocumentsAsContext } from 'src/shared/utils/format-document-as-context.js';
import { formatRecordAsDocument } from 'src/shared/utils/format-record-as-document.js';
import { readLocalFile } from 'src/shared/utils/read-local-file.js';
import { RefinedQuerySchema } from '../interfaces/refined-query-schema';
import { mapHistoryToOpenAI } from './map-base-to-openai';

export class RAGPipeline {
    public static prompts = {
        assistant: readLocalFile(`${pathes.prompts}/assistant.txt`),
        refinePrompt: readLocalFile(`${pathes.prompts}/refinePrompt.txt`),
        contextualizeEmbedding: readLocalFile(
            `${pathes.prompts}/contextualizeEmbedding.txt`,
        ),
    };

    public static llm = new ChatOpenAI({
        model: LlmModel.openai4nano,
        streaming: true,
    });

    public static async build(
        openai: OpenAI,
        cohere: CohereClient,
        chatsPineconeIndex: Index<RecordMetadata>,
        mongo: MongoService,
        chat: RepoChat,
    ): Promise<RunnableSequence> {
        // ✅ BUILDING PIPELINE
        await mongo.updateStatus(chat._id, ChatStatus.BUILDING_PIPELINE);

        await mongo.submitLog(
            `Model Details:\nLLM Model: ${LlmModel.openai4omini}\n`,
            chat._id,
        );

        await mongo.submitLog(`OpenAI client instantiated.`, chat._id);

        await mongo.submitLog(
            `Creating runnable "refinePrompt", to reinterpret message based on chat history and improve for RAG.`,
            chat._id,
        );

        const refinePrompt = RunnableSequence.from([
            new RunnablePassthrough().assign({
                refinedQuery: async (parameters: RagRunnableParameters) => {
                    await mongo.updateStatus(
                        chat._id,
                        ChatStatus.REFINING_QUERY,
                    );

                    await mongo.submitLog(
                        `STEP 1 - REFINE USER PROMPT USING CHAT HISTORY, KEYWORDS, AND INTENT...`,
                        chat._id,
                    );

                    const raw = await openai.chat.completions.create({
                        model: LlmModel.openai4omini,
                        messages: [
                            {
                                role: 'system',
                                content: this.prompts.refinePrompt,
                            },
                            ...mapHistoryToOpenAI(
                                parameters[RagRunnableProperties.history],
                            ),
                            {
                                role: 'user',
                                content:
                                    parameters[RagRunnableProperties.input],
                            },
                        ],
                        response_format: {
                            type: 'json_schema',
                            json_schema: RefinedQuerySchema,
                        },
                    });
                    const text = raw.choices[0].message.content;
                    const parsed = JSON.parse(text);

                    await mongo.submitLog(
                        `Refined Query:\n${JSON.stringify(parsed, null, 2)}`,
                        chat._id,
                    );

                    return parsed;
                },
            }),
            new RunnablePassthrough().assign({
                [RagRunnableProperties.interpretation]: (
                    parameters: RagRunnableParameters,
                ) => {
                    return parameters.refinedQuery.query;
                },
            }),
        ]);

        await mongo.submitLog(
            `Creating runnable "applyRag", to vectorize the new interpretation into an embedding.`,
            chat._id,
        );

        const applyRag = new RunnablePassthrough().assign({
            [RagRunnableProperties.documents]: RunnableSequence.from([
                async (parameters: RagRunnableParameters) => {
                    // ✅ GENERATING EMBEDDINGS
                    await mongo.updateStatus(
                        chat._id,
                        ChatStatus.GENERATING_EMBEDDINGS,
                    );

                    await mongo.submitLog(
                        `STEP 2 - VECTORIZE INPUT INTO EMBEDDINGS AND RETRIEVE DOCUMENTS FROM PINECONE...`,
                        chat._id,
                    );

                    const refined = parameters.refinedQuery;

                    const searchText = [
                        refined.query,
                        ...(refined.keywords ?? []),
                        ...(refined.code_patterns ?? []),
                        ...(refined.variants ?? []),
                    ].join('\n');

                    const queryDenseEmbeddings = (
                        await openai.embeddings.create({
                            input: searchText,
                            model: EmbeddingModel.openai,
                        })
                    ).data[0].embedding;

                    await mongo.submitLog(`Embedding generated.`, chat._id);

                    await mongo.submitLog(
                        `Preview: ${queryDenseEmbeddings.toString().slice(0, 50)}.`,
                        chat._id,
                    );

                    // ✅ RETRIEVING DOCUMENTS
                    await mongo.updateStatus(
                        chat._id,
                        ChatStatus.RETRIEVING_DOCUMENTS,
                    );

                    await mongo.submitLog(
                        `Using refined prompt to query up to 15 Pinecord records.`,
                        chat._id,
                    );

                    let res = await chatsPineconeIndex.query({
                        vector: queryDenseEmbeddings,
                        topK: 10,
                        includeMetadata: true,
                    });

                    const matches = res.matches.sort(
                        (a, b) => b.score - a.score,
                    );
                    await mongo.submitLog(
                        `Matched ${matches.length} records...`,
                        chat._id,
                    );
                    for (const [idx, d] of matches.entries()) {
                        await mongo.submitLog(
                            `Document #${idx + 1}\n\nRelevance Score: ${d.score}\n\nText: ${d.metadata.text}`,
                            chat._id,
                        );
                    }

                    const enforcedSimilarityScore = 0.3;
                    await mongo.submitLog(
                        `Enforcing similarity score of ${enforcedSimilarityScore}`,
                        chat._id,
                    );
                    const docs = matches.filter(
                        (d) => d.score > enforcedSimilarityScore,
                    );
                    await mongo.submitLog(
                        `${docs.length} Pinecone records matched!`,
                        chat._id,
                    );

                    return docs;
                },
                formatRecordAsDocument,
            ]),
        });

        await mongo.submitLog(
            `Creating runnable "rerankDocuments", for reorder produced documents based on chunk contexts.`,
            chat._id,
        );

        const rerankDocuments = new RunnablePassthrough().assign({
            [RagRunnableProperties.documents]: async (
                parameters: RagRunnableParameters,
            ) => {
                // ✅ RERANKING
                await mongo.updateStatus(
                    chat._id,
                    ChatStatus.RERANKING_DOCUMENTS,
                );

                let query = parameters[RagRunnableProperties.interpretation];
                let docs = parameters[RagRunnableProperties.documents];

                let rawDocContent = docs.map(
                    (d) => `
FILE:
${d.metadata.filepath}

SUMMARY:
${d.metadata.contextSummary ?? ''}

KEYWORDS:
${(d.metadata.contextKeywords ?? []).join(', ')}

INTENT:
${(d.metadata.intent ?? []).join(', ')}

RISK:
${(d.metadata.risk ?? []).join(', ')}

CODE:
${d.pageContent}
`,
                );

                await mongo.submitLog(
                    `STEP 3 - RERANK DOCUMENTS VIA COHERE, EMPHASIZING VECTOR SIMILARITY AND TO USER QUERY...`,
                    chat._id,
                );

                await mongo.submitLog(
                    `Re-ranking existing document order: ${docs.map((d, idx) => `${idx + 1}:${d.id}`).join(', ')}...`,
                    chat._id,
                );

                if (docs.length > 1) {
                    let res = await cohere.rerank({
                        query: query,
                        model: 'rerank-english-v3.0',
                        documents: rawDocContent,
                        topN: docs.length,
                    });

                    let rerankedDocs = res.results.map((r) => docs[r.index]);

                    await mongo.submitLog(
                        `Documents re-ranked: ${rerankedDocs.map((d, idx) => `${idx + 1}:${d.id}`).join(', ')}...`,
                        chat._id,
                    );
                    return rerankedDocs;
                } else {
                    await mongo.submitLog(
                        `Skipping document rerank, only ${docs.length} files provided.`,
                        chat._id,
                    );
                    return docs;
                }
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
                    await mongo.submitLog(`Context: ${context}...`, chat._id);
                    return context;
                },
            }),
            async (parameters: RagRunnableParameters) => {
                await mongo.updateStatus(
                    chat._id,
                    ChatStatus.GENERATING_RESPONSE,
                );

                await mongo.submitLog(
                    `STEP 4 - INVOKING LLM WITH INPUT, CHAT HISTORY, AND CONTEXTUALIZED RAG CHUNKS...`,
                    chat._id,
                );
                return parameters;
            },
            ChatPromptTemplate.fromMessages([
                ['system', this.prompts.assistant],
                [
                    'human',
                    `User query:\n\n{${RagRunnableProperties.interpretation}}`,
                ],
                [
                    'system',
                    `Repository context:\n\n{${RagRunnableProperties.context}}`,
                ],
            ]),
            RunnableLambda.from((input) => {
                console.log('===== RAG INPUT =====');
                console.log(JSON.stringify(input, null, 2));
                return input;
            }),
            RAGPipeline.llm,
        ]);

        const chain = RunnableSequence.from([
            refinePrompt,
            applyRag,
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
