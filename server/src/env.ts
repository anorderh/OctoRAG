import 'dotenv/config';

export const env = {
    server: {
        port: process.env.PORT!,
        origin: process.env.API_ORIGIN!,
        apiPath: process.env.API_PATH!,
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
            limit: 10
        }
    }
}