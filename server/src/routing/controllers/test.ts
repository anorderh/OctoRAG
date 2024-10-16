import { Request, Response } from "express";
import { Authorize, Controller, Get, Post } from '../decorators/index.js';
import { inject, singleton } from "tsyringe";
import { ControllerBase } from "../utils/abstract/controller.abstract.js";
import { Validate } from '../decorators/validate.js';
import { objectId } from "../utils/constants/objectid-validation.js";
import { Collection, ObjectId } from "mongodb";
import { MongoService } from "src/services/data/mongo.service.js";
import { Board } from "src/data/collections/board.collection.js";
import { CollectionId } from "src/data/utils/constants/collection-id.js";
import { executeMongoChecks } from "src/shared/utils/helpers/mongo-checks.js";
import { isValidBoard } from "src/data/validation/boards/is-valid-board.js";
import { RagService } from "src/services/ai/rag.service.js";
import Joi from "joi";
import { BoardUtility } from "src/shared/utils/classes/board.util.js";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token.js";
import { Logger } from "pino";
import { ScrapeEntry } from "src/scraping/utils/classes/scrape-entry.js";
import { App } from "src/App.js";
import { HostScrape } from "src/scraping/host-scrape.js";

@Controller('/test')
@singleton()
export class TestController extends ControllerBase {
    boardCollection: Collection<Board>;

    constructor(
        @inject(MongoService) private mongo: MongoService,
        @inject(RagService) private rag: RagService,
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

        let mostRecentVersion = BoardUtility.getMostRecentVersion(board);
        for(var f of mostRecentVersion.finds) {
            let scrape = new HostScrape(f);
            let entries = await scrape.scrape();

            if (scrape != null) {
                App.logger.info(
                    "OUTPUT:\n\n" +
                    JSON.stringify(
                        entries.map((e: ScrapeEntry<any>) => e.body), 
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