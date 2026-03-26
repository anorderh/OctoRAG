<img width="800" height="300" alt="octorag_banner" src="https://github.com/user-attachments/assets/e06d2d09-e115-44ec-9dbd-cca4885d9ef8" />

A web-based AI chat app using RAG and Anthropic's [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval) to explore Github codebases

## Demo

[Youtube Video](https://www.youtube.com/watch?v=vzlDCvqDFgU)

## Techstack

- **React** — Real-time chat UI with Shadcn, Zustand state, and streaming updates
- **Node.js / Express** — REST API for chat lifecycle, repo ingestion, and auth
- **MongoDB** — Persistent storage for chats, messages, logs, and session state
- **LangChain** — Orchestrates RAG pipeline (prompt refinement -> retrieval -> rerank -> context addition -> LLM)
- **Pinecone** — Vector store for code embeddings and query-time semantic retrieval of relevant chunks
- **Socket.io** — Bi-directional streaming for live logs, ingestion progress, and chat responses

## Core Capabilities

![octorag](https://github.com/user-attachments/assets/9d65cf7f-bb70-4639-a2c9-94fd58f5a5ce)

- **Repository Ingestion Pipeline**  
    Ingests GitHub repositories by downloading, parsing, chunking, and transforming source code into AI vector embeddings for storage & retrieval in Pinecone
    
- **RAG-Orchestrated Query Engine**  
    Executes AI I/O pipelines using LangChain, connecting stages such as prompt refinement, vector search, document reranking, and context formatting for LLM queries
    
- **Source-Grounded Code Analysis**  
    Enables context-aware responses by grounding inputs with source code retrieved directly from the repository, improving LLM outputs' accuracy
    
- **Interactive Full-Stack Experience**  
    Provides a real-time chat interface with React backed by a scalable Node.js/Express API and MongoDB for conversation and entity data management

## Use Cases

1. Quickly fetch and review real source code across your repository
2. Identify redundant, error-prone, vulnerable, or hard-to-maintain code snippets
3. Perform LLM-assisted code reviews grounded in *up-to-date* repository context (unlike ChatGPT)
4. Maintain an evolving AI intelligence layer over your private codebase to track features, architecture, and system behavior over time
