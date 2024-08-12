import express, { Express, Router } from "express";
import cors from "cors";
import { env } from "./env";
import { AzureBlobService } from "./services";
import { InjectionToken, container, injectable } from "tsyringe";
import { ControllerBase } from "./utils/abstract/controller";
import { AuthController, TestController, UserController } from "./routing/controllers";
import cookieParser from "cookie-parser";
import { useHttpContext } from "./routing/middleware/http-context";
import morgan from "morgan";
import { BoardController } from "./routing/controllers/board";
import { MongoService } from "./services/mongo.service";
import { errorHandler } from "./routing/middleware/error-handler";
import pino, { Logger } from "pino";
import { InstanceDeps } from "./utils/enums/instance-deps";
import { instancedDependencies } from "./utils/extensions/instance-deps";
import { AsyncService } from "./utils/abstract/async-service";
import { Server } from "http";

class App {
    express: Express
    server: Server;
    port: string;
    logger: Logger;
    middleware: any[] = [
        cors({
            origin: env.server.origin
        }),
        morgan('common'),
        express.json(),
        express.urlencoded(),
        cookieParser(),
        useHttpContext
    ]
    controllers: ControllerBase[] = [
        container.resolve(AuthController),
        container.resolve(TestController),
        container.resolve(UserController),
        container.resolve(BoardController)
    ];
    asyncServices: AsyncService[] = [
        container.resolve(MongoService),
        container.resolve(AzureBlobService)
    ]

    private _ensureInstanceDependencies() {
        Object.entries(instancedDependencies).forEach(([key, handler]) => {
            if (!container.isRegistered(key)) {
                handler();
            }
        })
    }

    private async _connectAsyncServices() : Promise<void> {
        for (let service of this.asyncServices) {
            await service.initialize();
        }
    }

    private _setupMiddleware() { 
        this.middleware.forEach((m) => this.express.use(m)); 
    }

    private _setupRouting() {
        this.controllers.forEach((c) => {
            this.express.use(env.server.apiPath, c.router)
        });
    }

    private _setupErrorHandler() {
        this.express.use(errorHandler);
    }

    constructor() {
        this.express = express();
        this.port = env.server.port;

        this._ensureInstanceDependencies();
        this.logger = container.resolve(InstanceDeps.Logger);

        this._setupMiddleware();
        this._setupRouting();
        this._setupErrorHandler();
    }

    public async startListening(): Promise<void> {
        try {
            this.logger.info(`Starting app...`);

            await this._connectAsyncServices();

            this.server = this.express.listen(this.port, () => {
                this.logger.info(`Server is running on port ${this.port}.`)
            });

            this.logger.info('App started!');
        } catch (err) {
            this.logger.error(
                { err: err },
                "Error occurred while initializing async services,"
            )
        }
    }

    public async stopListening(): Promise<void> {
        this.logger.info('Stopping app...');

        this.server.close();
        this.logger.info(`Server has stopped running.`);

        for (let service of this.asyncServices) {
            await service.cleanup();
        }

        this.logger.info(`App stopped!`);
    }
}

export default App;