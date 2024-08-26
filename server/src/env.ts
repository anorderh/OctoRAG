import 'dotenv/config';
import dotenv, { config } from 'dotenv';

// Hacky solution to handle VSCode Debug profiles & npm scripts having different spawn location.
let appEnv = process.env.APP_ENV!;
let cwdPrefix = Boolean(process.env.VSCODE_DEBUG) 
    ? "./server"
    : "."
let prematureEnv = {
    config: `${cwdPrefix}/config/.env.${appEnv}`,
    logs: `${cwdPrefix}/logs`,
}
dotenv.config({ path: prematureEnv.config })

export const env = {
    pathes: {
        logs: prematureEnv.logs
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
        }
    }
}