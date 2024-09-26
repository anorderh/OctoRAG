import { Request, Response } from "express";
import { Authorize, Controller, Get, Post } from '../decorators/index.js';
import { inject, singleton } from "tsyringe";
import { ControllerBase } from '../../utils/abstract/controller.js';
import { ScrapeService } from '../../services/scrape.service.js';
import { Validate } from '../decorators/validate.js';
import { objectId } from '../../utils/extensions/objectid-validation.js';
import { Collection, ObjectId } from "mongodb";
import { MongoService } from '../../services/index.js';
import { Board } from '../../data/collections/index.js';
import { CollectionId } from '../../utils/enums/collection-id.js';
import { executeMongoChecks } from '../../utils/extensions/mongo-checks.js';
import { isValidBoard } from '../../utils/validation/board.js';
import { RagService } from "src/services/rag.service.js";
import Joi from "joi";
import { BoardHelpers } from "src/utils/extensions/board-helpers.js";
import { ScrapeResult } from "src/utils/interfaces/scrape-result.js";
import { InstanceDeps } from "src/utils/enums/instance-deps.js";
import { Logger } from "pino";
import { ScrapeEntry } from "src/scraping/models/scrape-entry.js";

@Controller('/test')
@singleton()
export class TestController extends ControllerBase {
    boardCollection: Collection<Board>;

    constructor(
        @inject(MongoService) private mongo: MongoService,
        @inject(ScrapeService) private scrapeService: ScrapeService,
        @inject(RagService) private rag: RagService,
        @inject(InstanceDeps.Logger) private logger: Logger
    ) {
        super();
        this.boardCollection = this.mongo.db.collection(CollectionId.Board);
    }

    @Get('/')
    @Authorize()
    public test(req: Request, res: Response) {
        res.status(200).send("Auth successfully passed!");
    }

    @Post('/scrape/:_board_id')
    @Validate(
        'params',{
            _board_id: objectId.required()
        }
    )
    public async scrapeTest(req: Request, res: Response) {
        let boardId = new ObjectId(req.params['_board_id']);
        let board: Board = await this.boardCollection.findOne({
            _id: boardId
        }).then(executeMongoChecks<Board>([
            isValidBoard
        ]))

        let mostRecentVersion = BoardHelpers.getMostRecentVersion(board);
        for(var f of mostRecentVersion.finds) {
            let scrape = await this.scrapeService.scrape(f);

            if (scrape != null) {
                this.logger.info(
                    "OUTPUT:\n\n" +
                    JSON.stringify(
                        scrape.entries.map((e: ScrapeEntry<any>) => e.body), 
                        null, 
                        2
                    )
                );
            }
        }
        res.status(200).send("Scrape printed to console.");
    }

    @Post('/session/create/:_board_id')
    @Validate(
        'params',{
            _board_id: objectId.required()
        }
    )
    public async createRagSessionTest(req: Request, res: Response) {
        let session = await this.rag.createSession({
            boardId: new ObjectId(req.params['_board_id'])
        })
        res.status(200).send(session);
    }

    @Post('/session/chat')
    @Validate(
        'body',{
            sessionId: Joi.string().required(),
            input: Joi.string().required()
        }
    )
    public async chatRagSessionTest(req: Request, res: Response) {
        let sessionId = req.body.sessionId;
        let input = req.body.input;

        let chatRes = await this.rag.chat({
            sessionId,
            input
        })
        res.status(200).send(chatRes);
    }
}