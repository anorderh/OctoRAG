import express, { Express, Router } from "express";
import cors from "cors";
import { env } from "./env";
import { BlobService } from "./services";
import { InjectionToken, container, injectable } from "tsyringe";
import { ControllerBase } from "./utils/abstract/controller";
import { AuthController, TestController, UserController } from "./routing/controllers";
import cookieParser from "cookie-parser";
import { useHttpContext } from "./routing/middleware/http-context";
import morgan from "morgan";
import { BoardController } from "./routing/controllers/board";
import { MongoService } from "./services/mongo.service";
import { errorHandler } from "./routing/middleware/error-handler";

@injectable()
class App {
    express: Express
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
    dependencies: Promise<void[]> = Promise.all([
        container.resolve(MongoService).initialize(),
        container.resolve(BlobService).initialize()
    ])

    constructor() {
        this.express = express();
        this.middleware.forEach((m) => this.express.use(m));
        this.controllers.forEach((c) => {
            this.express.use(env.server.apiPath, c.router)
        });
        this.express.use(errorHandler);
    }
}

export default App;