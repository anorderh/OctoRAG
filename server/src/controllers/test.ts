import { Request, Response } from 'express';
import { MongoService } from 'src/services/mongo.service.js';
import { RagService } from 'src/services/rag.service.js';
import { inject, singleton } from 'tsyringe';
import { Controller } from './decorators/controller.js';
import { Get } from './decorators/http.js';
import { ControllerBase } from './shared/abstract/controller.abstract.js';

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
        res.status(200).send('Test successfully passed!');
    }

    @Get('/database')
    public async getDatabase(req: Request, res: Response) {
        let libraries = await this.mongo.collections.library.find().toArray();
        let resources = await this.mongo.collections.onlineResource
            .find()
            .toArray();
        let sessions = await this.mongo.collections.session.find().toArray();
        let chats = await this.mongo.collections.chat.find().toArray();

        res.status(200).send({
            libraries,
            resources,
            sessions,
            chats,
        });
    }
}
