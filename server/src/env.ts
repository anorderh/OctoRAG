import 'dotenv/config';

export const env = {
    server: {
        port: process.env.PORT,
        origin: process.env.API_ORIGIN!,
        apiPath: process.env.API_PATH!,
    },
    tokens: {
        refresh: {
            expiration: 3 * 24 * 60 * 60 // 3 days.
        },
        access: {
            name: process.env.JWT_KEY_NAME!,
            secret: process.env.JWT_SECRET!,
            expiration: 60 * 5 // 5 mins.
        }
    },
    azure: {
        connStr: process.env.AZURE_CONN_STR!,
        container: process.env.AZURE_CONTAINER_NAME!
    },
    mongo: {
        connStr: process.env.MONGO_CONN_STR!
    }
}