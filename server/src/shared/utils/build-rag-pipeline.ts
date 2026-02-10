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
    ): Promise<RunnableSequence> {
        const llm = new ChatOpenAI({
            model: LlmModel.openai,
            temperature: 0,
        });

        // Consider session's chat history.
        const considerHistory = new RunnablePassthrough().assign({
            [RagRunnableProperties.interpretation]: (
                parameters: RagRunnableParameters,
            ) => {
                let history = parameters[RagRunnableProperties.history];
                if (!!history && history.length > 0) {
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
                    return parameters[RagRunnableProperties.input];
                }
            },
        });

        const applyRag = new RunnablePassthrough().assign({
            [RagRunnableProperties.documents]: RunnableSequence.from([
                async (parameters: RagRunnableParameters) => {
                    const queryDenseEmbeddings = (
                        await openai.embeddings.create({
                            input: parameters[
                                RagRunnableProperties.interpretation
                            ],
                            model: EmbeddingModel.openai,
                        })
                    ).data[0].embedding;

                    // Apply BM25 sparse embedding search here later.
                    // Though this will prob shift to Python cloud func, keep it in mind.
                    let res = await chatsPineconeIndex.query({
                        vector: queryDenseEmbeddings,
                        topK: 20,
                        includeMetadata: true,
                    });
                    let records: ScoredPineconeRecord[] = res.matches;
                    return records;
                },
                formatRecordAsDocument,
            ]),
        });

        const contextualizeDocuments = new RunnablePassthrough().assign({
            [RagRunnableProperties.documents]: async (
                parameters: RagRunnableParameters,
            ) => {
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

        const rerankDocuments = new RunnablePassthrough().assign({
            [RagRunnableProperties.documents]: async (
                parameters: RagRunnableParameters,
            ) => {
                let query = parameters[RagRunnableProperties.interpretation];
                let docs = parameters[RagRunnableProperties.documents];

                let rawDocContent = docs.map((d) => d.pageContent);
                let res = await cohere.rerank({
                    query: query,
                    model: 'rerank-english-v2.0',
                    documents: rawDocContent,
                    topN: 20,
                });
                let rerankedDocs = res.results.map((r) => docs[r.index]);

                return rerankedDocs;
            },
        });

        const queryLLM = RunnableSequence.from([
            new RunnablePassthrough().assign({
                [RagRunnableProperties.context]: (
                    parameters: RagRunnableParameters,
                ) => {
                    let docs = parameters[RagRunnableProperties.documents];
                    return formatDocumentsAsContext(docs);
                },
            }),
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

        return chain;
    }
}
