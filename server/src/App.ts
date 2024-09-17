import express, { Express, Router } from "express";
import cors from "cors";
import { env } from './env.js';
import { AzureBlobService } from './services';
import { InjectionToken, container, injectable } from "tsyringe";
import { ControllerBase } from './utils/abstract/controller.js';
import { AuthController, TestController, UserController } from './routing/controllers';
import cookieParser from "cookie-parser";
import { useHttpContext } from './routing/middleware/http-context.js';
import morgan from "morgan";
import { BoardController } from './routing/controllers/board.js';
import { MongoService } from './services/mongo.service.js';
import { errorHandler } from './error-handling/error-handler.js';
import pino, { Logger } from "pino";
import { InstanceDeps } from './utils/enums/instance-deps.js';
import { AsyncService } from './utils/abstract/async-service.js';
import { Server } from "http";
import { instancedDependencies } from './dependencies.js';
import { RagService } from "./services/rag.service.js";

@injectable()
export class App {
    express: Express
    server: Server;
    port: string;

    middleware: any[] = [
        cors({
            origin: env.server.origin
        }),
        env.logging.http ? morgan('common') : null,
        express.json(),
        express.urlencoded(),
        cookieParser(),
        useHttpContext
    ].filter(m => !!m);
    injection = {
        controllers: [
            AuthController,
            TestController,
            UserController,
            BoardController
        ] as InjectionToken<ControllerBase>[],
        asyncServices: [
            MongoService,
            AzureBlobService,
            RagService
        ] as InjectionToken<AsyncService>[]
    }
    logger: Logger;


    constructor() {
        // Setup express server.
        this.express = express();
        this.port = env.server.port;

        // Initialize and inject non-class values.
        Object.entries(instancedDependencies).forEach(([key, handler]) => {
            if (!container.isRegistered(key)) {
                handler();
            }
        })
        this.logger = container.resolve(InstanceDeps.Logger);

        // Setup middleware.
        this.middleware.forEach((m) => this.express.use(m)); 

        // Setup routing.
        for (let token of this.injection.controllers) {
            let controller = container.resolve(token);
            this.express.use(env.server.apiPath, controller.router)
        }

        // Setup error handler.
        this.express.use(errorHandler);
    }

    public async startListening(): Promise<void> {
        this.logger.info(`Starting app...`);

        // Connect async services.
        for (let token of this.injection.asyncServices) {
            let service = container.resolve(token);
            await service.initialize();
        }

        this.server = this.express.listen(this.port, () => {
            this.logger.info(`Server is running on port ${this.port}.`)
        });
        this.logger.info('App started!');
    }

    public async stopListening(): Promise<void> {
        this.logger.info('Stopping app...');
        this.server.close();
        this.logger.info(`Server has stopped running.`);

        // Cleanup async services.
        for (let token of this.injection.asyncServices) {
            let service = container.resolve(token);
            await service.cleanup();
        }

        this.logger.info(`App stopped!`);
    }
}