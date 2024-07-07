import dotenv from 'dotenv';

dotenv.config();

export const env = {
    server: {
        port: 3000
    },
    azure: {
        connStr: ''
    },
    mongo: {
        connStr: ''
    }
}