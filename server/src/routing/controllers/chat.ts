import { Request, Response } from "express";
import { Authorize, Controller, Delete, Get, Post } from '../decorators/index.js';
import { inject, singleton } from "tsyringe";
import { ControllerBase } from "../utils/abstract/controller.abstract.js";
import { Validate } from '../decorators/validate.js';
import { objectId } from "../utils/constants/objectid-validation.js";
import { Collection, ObjectId } from "mongodb";
import { MongoService } from "src/services/data/mongo.service.js";
import { CollectionId } from "src/data/utils/constants/collection-id.js";
import { executeMongoChecks } from "src/shared/utils/helpers/mongo-checks.js";
import { RagService } from "src/services/ai/rag.service.js";
import Joi, { object } from "joi";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token.js";
import { Logger } from "pino";
import { ScrapeEntry } from "src/scraping/utils/classes/scrape-entry.js";
import { App } from "src/App.js";
import { OnlineResourceScrape } from "src/scraping/online-resource-scrape.js";
import { ResourceType } from "src/data/utils/constants/resource-type.js";
import { ConfirmResourceRequest } from "./validation/requests/confirm-resource.req.js";
import { CreateSessionRequest } from "./validation/requests/create-session.req.js";
import { Library } from "src/data/collections/library.collection.js";
import { isValidLibrary } from "src/data/validation/library/is-valid-library.js";
import { create } from "lodash";
import { ChatRequest } from "./validation/requests/chat.req.js";

@Controller('/chat')
@singleton()
export class ChatController extends ControllerBase {
    constructor(
        @inject(MongoService) private mongo: MongoService,
        @inject(RagService) private rag: RagService,
    ) {
        super();
    }

    @Post('/session')
    @Validate(
        'body', {
            _libraryId: objectId.required(),
            llmModel: Joi.string().required(),
            forceNewScrape: Joi.boolean(),
            embeddingModel: Joi.string()
        }
    )
    public async createSession(req: Request, res: Response) {
        let createReq = req.body as CreateSessionRequest;
        let library = await this.mongo.collections.library.findOne({
            _id: new ObjectId(createReq._libraryId)
        }).then(executeMongoChecks<Library>([
            isValidLibrary
        ]));

        let session = await this.rag.createSession({
            library,
            llmModel: createReq.llmModel,
            forceNewScrape: createReq.forceNewScrape,
            embeddingModel: createReq.embeddingModel
        });

        res.status(200).send({
            _sessionId: session._id,
            msg: "Session successfully created."
        })
    }

    @Post('/session/input')
    @Validate(
        'body', {
            _sessionId: objectId.required(),
            input: Joi.string().required()
        }
    )
    public async chat(req: Request, res: Response) {
        let chatReq = req.body as ChatRequest;
        let chatRes = await this.rag.chat({
            input: chatReq.input,
            _sessionId: new ObjectId(chatReq._sessionId)
        });

        res.status(200).send({
            msg: "Chat successfully input.",
            debug: chatRes
        })
    }

    @Delete('/session/:_sessionId')
    @Validate(
        'params', {
            _sessionId: objectId.required()
        }
    )
    public async closeSession(req: Request, res: Response) {
        let _sessionId = new ObjectId(req.params._sessionId);
        await this.rag.closeSession(_sessionId);
        res.status(200).send({
            _sessionId,
            msg: "Session successfully deleted."
        })
    }
}