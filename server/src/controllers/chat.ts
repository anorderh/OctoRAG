import { Request, Response } from 'express';
import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { Library } from 'src/database/collections/library.collection.js';
import { isValidLibrary } from 'src/database/shared/validation/library/is-valid-library.js';
import { MongoService } from 'src/services/mongo.service.js';
import { RagService } from 'src/services/rag.service.js';
import { executeMongoChecks } from 'src/shared/utils/mongo-checks.js';
import { inject, singleton } from 'tsyringe';
import { Controller, Delete, Post } from '../controllers/decorators/index.js';
import { Validate } from '../controllers/decorators/validate.js';
import { ControllerBase } from './shared/abstract/controller.abstract.js';
import { objectId } from './shared/constants/objectid-validation.js';
import { ChatRequest } from './shared/validation/requests/chat.req.js';
import { CreateSessionRequest } from './shared/validation/requests/create-session.req.js';

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
    @Validate('body', {
        _libraryId: objectId.required(),
        llmModel: Joi.string().required(),
        forceNewScrape: Joi.boolean(),
        embeddingModel: Joi.string(),
    })
    public async createSession(req: Request, res: Response) {
        let createReq = req.body as CreateSessionRequest;
        let library = await this.mongo.collections.library
            .findOne({
                _id: new ObjectId(createReq._libraryId),
            })
            .then(executeMongoChecks<Library>([isValidLibrary]));

        let session = await this.rag.createSession({
            library,
            llmModel: createReq.llmModel,
            forceNewScrape: createReq.forceNewScrape,
            embeddingModel: createReq.embeddingModel,
        });

        res.status(200).send({
            _sessionId: session._id,
            msg: 'Session successfully created.',
        });
    }

    @Post('/session/input')
    @Validate('body', {
        _sessionId: objectId.required(),
        input: Joi.string().required(),
    })
    public async chat(req: Request, res: Response) {
        let chatReq = req.body as ChatRequest;
        let chatRes = await this.rag.chat({
            input: chatReq.input,
            _sessionId: new ObjectId(chatReq._sessionId),
        });

        res.status(200).send({
            msg: 'Chat successfully input.',
            debug: chatRes,
        });
    }

    @Delete('/session/:_sessionId')
    @Validate('params', {
        _sessionId: objectId.required(),
    })
    public async closeSession(req: Request, res: Response) {
        let _sessionId = new ObjectId(req.params._sessionId);
        await this.rag.closeSession(_sessionId);
        res.status(200).send({
            _sessionId,
            msg: 'Session successfully deleted.',
        });
    }
}
