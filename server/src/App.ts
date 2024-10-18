import express, { Express, Router } from "express";
import cors from "cors";
import { InjectionToken, container, injectable, singleton } from "tsyringe";
import cookieParser from "cookie-parser";
import { useHttpContext } from './routing/middleware/http-context.js';
import morgan from "morgan";
import { DependencyInjectionToken } from "./dependencies/utils/constants/dependency-injection-token.js";
import { MongoService } from './services/data/mongo.service.js';
import { UserService } from "./services/data/user.service.js";
import { errorHandler } from './error-handling/error-handler.js';
import pino, { Logger } from "pino";
import { Server } from "http";
import { RagService } from "./services/ai/rag.service.js";
import { env } from "./shared/utils/constants/env.js";
import { AuthController } from "./routing/controllers/auth.js";
import { TestController } from "./routing/controllers/test.js";
import { UserController } from "./routing/controllers/user.js";
import { ControllerBase } from "./routing/utils/abstract/controller.abstract.js";
import { Service } from "./services/utils/abstract/service.abstract.js";
import { StorageService } from "./services/integration/storage.service.js";
import { exit } from "process";
import { EmailService } from "./services/integration/email.service.js";
import { instantiate } from "./dependencies/utils/extensions/instantiate.js";
import { AppDependencies } from "./shared/utils/interfaces/app-dependencies.js";
import { ChatController } from "./routing/controllers/chat.js";
import { LibraryController } from "./routing/controllers/library.js";
import { PipelineService } from "./services/ai/pipeline.service.js";
import path from "path";
import { __dirname } from "./__dirname.js";

export class App {
    static logger: Logger;

    port: string;
    express: Express
    server: Server;

    static dependencies : AppDependencies;
    static injection = {
        dependencies: [
            DependencyInjectionToken.Pino,
            DependencyInjectionToken.OpenAI,
            DependencyInjectionToken.Pinecone,
            DependencyInjectionToken.Innertube,
            DependencyInjectionToken.Octokit,
            DependencyInjectionToken.Snoowrap,
            DependencyInjectionToken.SeleniumWebDriver,
            DependencyInjectionToken.Cohere
        ] as DependencyInjectionToken[],
        services: [
            RagService,
            MongoService,
            MongoService,
            UserService,
            EmailService,
            StorageService,
            PipelineService
        ] as InjectionToken<Service>[],
        controllers: [
            AuthController,
            TestController,
            UserController,
            ChatController,
            LibraryController
        ] as InjectionToken<ControllerBase>[],
    }

    middleware: any[] = [
        cors({
            origin: [
                env.server.origin,
                'http://localhost:8080'
            ]
        }),
        env.logging.http ? morgan('common') : null,
        express.json(),
        express.urlencoded(),
        cookieParser(),
        useHttpContext
    ].filter(m => !!m);

    constructor() {
        this.port = env.server.port;
        App.logger = container.resolve(DependencyInjectionToken.Pino);
    }

    public async start() {
        await this.build();
        await this.listen();
    }

    public async build(): Promise<void> {
        App.logger.info(`Building Express app...`);
        this.express = express();

        App.logger.info(`Setting up middleware...`);
        this.middleware.forEach((m) => this.express.use(m)); 

        App.logger.info('Setting up assets...');
        this.express.use(express.static(path.join(__dirname, "../../client/dist")));

        App.logger.info(`Setting up controllers...`);
        for (let token of App.injection.controllers) {
            let controller = container.resolve(token);
            this.express.use(env.server.apiPath, controller.router)
        }

        App.logger.info('Setting up frontend routes...')
        this.express.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
        });

        App.logger.info(`Setting up error handler...`);
        this.express.use(errorHandler);
    }

    public async listen(): Promise<void> {
        App.logger.info(`Starting Express app...`);
        // Start services.
        for (let token of App.injection.services) {
            let service = container.resolve(token);
            await service.initialize();
        }

        this.server = this.express.listen(this.port, () => {
            App.logger.info(`Server is listening on port ${this.port}.`)
        });
        App.logger.info('App started!');
    }

    public async stop(): Promise<void> {
        App.logger.info('Stopping Express app...');
        this.server.close();
        App.logger.info(`Server has stopped listening.`);

        // Cleanup async services.
        for (let token of App.injection.services) {
            let service = container.resolve(token);
            await service.cleanup();
        }

        App.logger.info(`App stopped!`);
    }
}