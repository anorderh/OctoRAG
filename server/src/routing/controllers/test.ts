import { Request, Response } from "express";
import { Authorize, Controller, Get, Post } from '../decorators/index.js';
import { inject, singleton } from "tsyringe";
import { ControllerBase } from "../utils/abstract/controller.abstract.js";
import { Validate } from '../decorators/validate.js';
import { objectId } from "../utils/constants/objectid-validation.js";
import { Collection, ObjectId } from "mongodb";
import { MongoService } from "src/services/data/mongo.service.js";
import { CollectionId } from "src/data/utils/constants/collection-id.js";
import { executeMongoChecks } from "src/shared/utils/helpers/mongo-checks.js";
import { RagService } from "src/services/ai/rag.service.js";
import Joi from "joi";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token.js";
import { Logger } from "pino";
import { ScrapeEntry } from "src/scraping/utils/classes/scrape-entry.js";
import { App } from "src/App.js";
import { OnlineResourceScrape } from "src/scraping/online-resource-scrape.js";

@Controller('/test')
@singleton()
export class TestController extends ControllerBase {
    constructor(
        @inject(MongoService) private mongo: MongoService,
        @inject(RagService) private rag: RagService,
    ) {
        super();
    }

    @Get('/')
    public test(req: Request, res: Response) {
        res.status(200).send("Test successfully passed!");
    }

    @Get('/database')
    public async getDatabase(req: Request, res: Response) {
        let libraries = await this.mongo.collections.library.find().toArray();
        let resources = await this.mongo.collections.onlineResource.find().toArray();
        let sessions = await this.mongo.collections.session.find().toArray();
        let chats = await this.mongo.collections.chat.find().toArray();

        res.status(200).send({
            libraries,
            resources,
            sessions,
            chats
        })
    }
    
}