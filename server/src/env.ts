import 'dotenv/config';
import dotenv, { config } from 'dotenv';
import { pathes } from './pathes';

dotenv.config({ path: pathes.config })

export const env = {
    pathes: {
        temp: pathes.temp,
        logs: pathes.logs,
        chrome: process.env.PUPPETEER_CHROME_EXECUTABLE_PATH!,
        seedData: pathes.seedData
    },
    server: {
        port: process.env.PORT!,
        origin: process.env.API_ORIGIN!,
        apiPath: process.env.API_PATH!,
        secure: process.env.SECURE! == "true"
    },
    logging: {
        toFile: process.env.LOG_TO_FILE! == "true",
        toConsole: process.env.LOG_TO_CONSOLE! == "true",
        http: process.env.LOG_HTTP! == "true"
    },
    email: {
        host: process.env.EMAIL_HOST!,
        port: Number(process.env.EMAIL_PORT!),
        secure: process.env.EMAIL_SECURE! == "true",
        auth: {
            user: process.env.EMAIL_AUTH_USERNAME!,
            pass: process.env.EMAIL_AUTH_PASSWORD!
        }
    },
    azure: {
        connStr: process.env.AZURE_CONN_STR!,
        container: process.env.AZURE_CONTAINER_NAME!
    },
    mongo: {
        connStr: process.env.MONGO_CONN_STR!
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
        }
    },
    defaults: {
        pagination: {
            skip: 0,
            limit: 10,
            maxLimit: 50
        },
        chunking: {
            chunkSize: 512,
            chunkOverlap: 35,
            batchSize: 100,
        }
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY!,
        llmModel: {
            name: process.env.OPENAI_LLM_MODEL!
        },
        embeddingModel: {
            name: process.env.OPENAI_EMBEDDINGS_MODEL!,
            dimensions: Number(process.env.OPENAI_EMBEDDINGS_MODEL_DIMENSIONALITY!)
        }
    },
    pinecone: {
        apiKey: process.env.PINECONE_API_KEY!,
        ragIndexName: process.env.PINECONE_RAG_INDEX_NAME!,
        cloud: process.env.PINECONE_CSP!,
        region: process.env.PINECONE_CSP_REGION!
    }
}