import dotenv from 'dotenv';
import 'dotenv/config';
import { pathes } from './pathes.js';

dotenv.config({ path: pathes.config });

export const env = {
    // Current env values.
    pathes: {
        temp: pathes.temp,
        logs: pathes.logs,
        chrome: process.env.PUPPETEER_CHROME_EXECUTABLE_PATH!,
        seedData: pathes.seedData,
    },
    server: {
        port: process.env.PORT!,
        origin: process.env.API_ORIGIN!,
        apiPath: process.env.API_PATH!,
        secure: process.env.SECURE! == 'true',
    },
    logging: {
        toFile: process.env.LOG_TO_FILE! == 'true',
        toConsole: process.env.LOG_TO_CONSOLE! == 'true',
        http: process.env.LOG_HTTP! == 'true',
    },
    email: {
        host: process.env.EMAIL_HOST!,
        port: Number(process.env.EMAIL_PORT!),
        secure: process.env.EMAIL_SECURE! == 'true',
        auth: {
            user: process.env.EMAIL_AUTH_USERNAME!,
            pass: process.env.EMAIL_AUTH_PASSWORD!,
        },
    },
    mongo: {
        connStr: process.env.MONGO_CONN_STR!,
    },
    tokens: {
        access: {
            secret: process.env.ACCESS_JWT_SECRET!,
            name: process.env.ACCESS_JWT_NAME!,
            expr: Number(process.env.ACCESS_JWT_EXPR!),
        },
        refresh: {
            secret: process.env.REFRESH_JWT_SECRET!,
            name: process.env.REFRESH_JWT_NAME!,
            expr: Number(process.env.REFRESH_JWT_EXPR!),
        },
        verify: {
            secret: process.env.VERIFY_JWT_SECRET!,
            name: process.env.VERIFY_JWT_NAME!,
            expr: Number(process.env.REFRESH_JWT_EXPR!),
        },
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY!,
        llmModel: {
            name: process.env.OPENAI_LLM_MODEL!,
        },
        embeddingModel: {
            name: process.env.OPENAI_EMBEDDINGS_MODEL!,
            dimensions: Number(
                process.env.OPENAI_EMBEDDINGS_MODEL_DIMENSIONALITY!,
            ),
        },
    },
    cohere: {
        apiKey: process.env.COHERE_API_KEY!,
    },
    pinecone: {
        apiKey: process.env.PINECONE_API_KEY!,
        ragIndexName: process.env.PINECONE_RAG_INDEX_NAME!,
        cloud: process.env.PINECONE_CSP!,
        region: process.env.PINECONE_CSP_REGION!,
    },
    // Unused envs, for future impl.
    defaults: {
        pagination: {
            skip: Number(process.env.DEFAULT_PAGINATION_SKIP!),
            limit: Number(process.env.DEFAULT_PAGINATION_LIMIT!),
            maxLimit: Number(process.env.DEFAULT_PAGINATION_MAX_LIMIT!),
        },
        chunking: {
            chunkSize: Number(process.env.DEFAULT_CHUNKING_SIZE!),
            chunkOverlap: Number(process.env.DEFAULT_CHUNKING_OVERLAP!),
            batchSize: Number(process.env.DEFAULT_CHUNKING_BATCH_SIZE!),
        },
    },
    youtube: {
        apiKey: process.env.YOUTUBE_API_KEY!,
    },
    reddit: {
        clientId: process.env.REDDIT_CLIENT_ID!,
        clientSecret: process.env.REDDIT_CLIENT_SECRET!,
        userAgent: process.env.REDDIT_USER_AGENT!,
        username: process.env.REDDIT_USERNAME!,
        password: process.env.REDDIT_PASSWORD!,
    },
    azure: {
        connStr: process.env.AZURE_CONN_STR!,
        container: process.env.AZURE_CONTAINER_NAME!,
    },
};
