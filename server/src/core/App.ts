import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import {
    createServer,
    Server as HttpServer,
    IncomingMessage,
    ServerResponse,
} from 'http';
import morgan from 'morgan';
import path from 'path';
import { Logger } from 'pino';
import { Server } from 'socket.io';
import { container, InjectionToken } from 'tsyringe';
import { __dirname } from '../__dirname.js';
import { AuthController } from '../controllers/auth.js';
import { ChatController } from '../controllers/chat.js';
import { useHttpContext } from '../controllers/middleware/http-context.js';
import { ControllerBase } from '../controllers/shared/abstract/controller.abstract.js';
import { UserController } from '../controllers/user.js';
import { EmailService } from '../services/email.service.js';
import { MongoService } from '../services/mongo.service.js';
import { RagService } from '../services/rag.service.js';
import { UserService } from '../services/user.service.js';
import { DependencyInjectionToken } from '../shared/constants/dependency-injection-token.js';
import { env } from '../shared/constants/env.js';
import { errorHandler } from '../shared/utils/error-handler.js';
import { WebSocket } from './WebSocket.js';

export class App {
    port: string = env.server.port;
    express: Express = express();
    server: HttpServer<typeof IncomingMessage, typeof ServerResponse>;
    websocket: WebSocket;

    static logger: Logger; // For global logging.

    services: InjectionToken<any>[] = [
        RagService,
        MongoService,
        UserService,
        EmailService,
    ];
    controllers: InjectionToken<ControllerBase>[] = [
        AuthController,
        UserController,
        ChatController,
    ];
    middleware: any[] = [
        cors({
            origin: [env.server.origin, 'http://localhost:5173'],
            credentials: true,
        }),
        env.logging.http ? morgan('common') : null,
        express.json(),
        express.urlencoded(),
        cookieParser(),
        useHttpContext,
    ].filter((m) => !!m);

    constructor() {
        App.logger = container.resolve(DependencyInjectionToken.Pino);
    }

    public async start(): Promise<void> {
        App.logger.info(`Building Express app...`);
        this.express = express();

        App.logger.info(`Setting up middleware...`);
        this.middleware.forEach((m) => {
            this.express.use(m);
        });

        App.logger.info('Setting up assets...');
        this.express.use(
            express.static(path.join(__dirname, '../../client/dist')),
        );

        App.logger.info(`Setting up controllers...`);
        for (let token of this.controllers) {
            let controller = container.resolve(token);
            this.express.use(env.server.apiPath, controller.router);
        }

        App.logger.info('Setting up frontend routes...');
        this.express.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
        });

        App.logger.info(`Setting up error handling...`);
        this.express.use(errorHandler);

        App.logger.info(`Setting up services...`);
        const services = [];
        for (let token of this.services) {
            let service = container.resolve(token);
            await service.initialize();
        }

        App.logger.info('Setting up websockets...');
        this.server = createServer(this.express);
        const io = new Server(this.server);
        const mongo = container.resolve(MongoService);
        this.websocket = new WebSocket(io, mongo);
        setInterval(() => {
            io.emit('heartbeat', {
                time: new Date().toISOString(),
            });
        }, 2000);

        App.logger.info(`Starting Express app...`);
        this.server.listen(this.port, () => {
            App.logger.info(`Server is listening on port ${this.port}.`);
        });
        App.logger.info('App started!');
    }

    public async stop(): Promise<void> {
        App.logger.info('Stopping Express app...');
        this.server.close();
        App.logger.info(`Server has stopped listening.`);

        // Cleanup async services.
        for (let token of this.services) {
            let service = container.resolve(token);
            await service.cleanup();
        }
        App.logger.info(`App stopped!`);
    }
}
