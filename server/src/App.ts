import express, { Express, Router } from "express";
import cors from "cors";
import { env } from "./env";
import mongoose from "mongoose";
import { BlobService } from "./services";
import { container } from "tsyringe";
import { ControllerBase } from "./utils/abstract/controller";
import { AuthController } from "./routing/controllers";

class App {
    dependencies: Promise<void[]> = Promise.all([
        mongoose.connect(env.mongo.connStr).then(() => {
            console.log("Mongoose successfully setup.")
        }),
        container.resolve(BlobService).initialize().then(() => {
            console.log("Azure Blob Service successfully setup.");
        })
    ])
    express: Express
    middleware: any[] = [
        cors({
            origin: env.server.origin
        }),
        express.json(),
        express.urlencoded()
    ]
    controllers: ControllerBase[] = [
        AuthController
    ].map((token) => container.resolve(token));

    constructor() {
        this.express = express();
        this.middleware.forEach((m) => this.express.use(m));
        this.controllers.forEach((c) => {
            this.express.use(env.server.apiPath, c.router)
        });
    }
}

export default App;