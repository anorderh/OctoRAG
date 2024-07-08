import 'dotenv/config';

export const env = {
    server: {
        port: process.env.PORT,
        origin: process.env.API_ORIGIN!,
        apiPath: process.env.API_PATH!
    },
    azure: {
        connStr: process.env.AZURE_CONN_STR!,
        container: process.env.AZURE_CONTAINER_NAME!
    },
    mongo: {
        connStr: process.env.MONGO_CONN_STR!
    }
}