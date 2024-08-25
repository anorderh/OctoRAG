import 'dotenv/config';

export const env = {
    node_env: process.env.NODE_ENV!,
    server: {
        port: process.env.PORT!,
        origin: process.env.API_ORIGIN!,
        apiPath: process.env.API_PATH!,
        domain: process.env.API_DOMAIN!
    },
    email: {
        host: process.env.EMAIL_HOST!,
        port: Number(process.env.EMAIL_PORT!),
        secure: Boolean(process.env.EMAIL_SECURE!),
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