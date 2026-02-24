import Tippy from '@tippyjs/react';
import { FaReact } from 'react-icons/fa';
import { SiExpress, SiMongodb, SiOpenai } from 'react-icons/si';
import cohereLogo from '../../assets/cohere.png';
import langchainLogo from '../../assets/langchain.png';
import octoragLogo from '../../assets/octorag-logo.png';
import pineconeLogo from '../../assets/pinecone.svg';

export function Header() {
    return (
        <div
            className="w-100 d-flex flex-row gap-5 mb-4 align-items-center justify-content-center text-center"
            style={{
                borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}>
            <img
                src={octoragLogo}
                alt="OctoRAG Logo"
                style={{
                    width: 400,
                }}
            />

            <div
                className="d-flex flex-column mt-3 mb-2"
                style={{
                    fontFamily: 'Google Sans Code, ui-monospace, monospace',
                }}>
                <h1 className="fw-bold" style={{ fontSize: 48 }}>
                    OctoRAG
                </h1>
                <p
                    style={{
                        maxWidth: 640,
                        marginBottom: '2rem',
                        fontSize: 24,
                    }}>
                    Chat with GitHub repositories using <br />
                    Retrieval Augmented Generation (RAG)
                </p>

                <h4 className="mb-4">Tools:</h4>
                <div className="d-flex flex-row gap-4 justify-content-center flex-wrap align-items-center">
                    <Tippy
                        content="React for client components and state management"
                        placement="top">
                        <span>
                            <FaReact size={30} color="#61DAFB" />
                        </span>
                    </Tippy>

                    <Tippy
                        content="Express for server API, request handling, user auth"
                        placement="top">
                        <span>
                            <SiExpress size={30} color="#FFFFFF" />
                        </span>
                    </Tippy>

                    <Tippy
                        content="MongoDB for storing entity data"
                        placement="top">
                        <span>
                            <SiMongodb size={30} color="#47A248" />
                        </span>
                    </Tippy>

                    <Tippy
                        content="OpenAI for natural language querying and embedding vectorization"
                        placement="top">
                        <span>
                            <SiOpenai size={30} color="#10A37F" />
                        </span>
                    </Tippy>
                    <Tippy
                        content="Pinecone for storing & querying embeddings"
                        placement="top">
                        <span>
                            <img
                                src={pineconeLogo}
                                alt="Pinecone"
                                style={{
                                    height: 22,
                                    width: 'auto',
                                    objectFit: 'contain',
                                    filter: 'invert(1)',
                                }}
                            />
                        </span>
                    </Tippy>

                    <Tippy
                        content="Cohere Rerank API for reranking fetched documents"
                        placement="top">
                        <span>
                            <img
                                src={cohereLogo}
                                alt="Cohere"
                                style={{
                                    height: 22,
                                    width: 'auto',
                                    objectFit: 'contain',
                                }}
                            />
                        </span>
                    </Tippy>
                    <Tippy
                        content="LangChain orchestrates the RAG pipeline — prompt composition, vector retrieval, model calls, and reranking"
                        placement="top">
                        <span>
                            <img
                                src={langchainLogo}
                                alt="Langchain"
                                style={{
                                    borderRadius: 16,
                                    height: 36,
                                    width: 'auto',
                                    objectFit: 'contain',
                                }}
                            />
                        </span>
                    </Tippy>
                </div>
            </div>
        </div>
    );
}
