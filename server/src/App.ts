import express, { Express, Router } from "express";
import cors from "cors";
import { env } from './env.js';
import { AzureBlobService } from "./services/azure-blob.service..js";
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
    port: string;
    logger: Logger;
    express: Express
    server: Server;

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

    constructor() {
        this.port = env.server.port;
        this.logger = container.resolve(InstanceDeps.Logger);
    }

    public async start() {
        await this.build();
        await this.listen();
    }

    private async build(): Promise<void> {
        this.logger.info(`Building Express app...`);
        this.express = express();

        this.logger.info(`Instantiating custom dependencies...`);
        let deps = Object.entries(instancedDependencies);
        for(let [key, init] of deps) {
            if (!container.isRegistered(key)) {
                await init();
            }
        }

        this.logger.info(`Setting up middleware...`);
        this.middleware.forEach((m) => this.express.use(m)); 

        this.logger.info(`Setting up controllers...`);
        for (let token of this.injection.controllers) {
            let controller = container.resolve(token);
            this.express.use(env.server.apiPath, controller.router)
        }

        this.logger.info(`Setting up error handler...`);
        this.express.use(errorHandler);
    }

    private async listen(): Promise<void> {
        this.logger.info(`Starting Express app...`);
        // Connect async services.
        for (let token of this.injection.asyncServices) {
            let service = container.resolve(token);
            await service.initialize();
        }

        this.server = this.express.listen(this.port, () => {
            this.logger.info(`Server is listening on port ${this.port}.`)
        });
        this.logger.info('App started!');
    }

    public async stop(): Promise<void> {
        this.logger.info('Stopping Express app...');
        this.server.close();
        this.logger.info(`Server has stopped listening.`);

        // Cleanup async services.
        for (let token of this.injection.asyncServices) {
            let service = container.resolve(token);
            await service.cleanup();
        }

        this.logger.info(`App stopped!`);
    }
}