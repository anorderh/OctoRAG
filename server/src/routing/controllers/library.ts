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
import Joi, { object } from "joi";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token.js";
import { Logger } from "pino";
import { ScrapeEntry } from "src/scraping/utils/classes/scrape-entry.js";
import { App } from "src/App.js";
import { OnlineResourceScrape } from "src/scraping/online-resource-scrape.js";
import { StorageService } from "src/services/integration/storage.service.js";
import { ResourceType } from "src/data/utils/constants/resource-type.js";
import { Resource } from "src/data/collections/resource.collection.js";
import { OnlineResourceType } from "src/data/utils/constants/online-resource-type.js";
import { OnlineResource } from "src/data/collections/online-resource.collection.js";
import { httpContext } from "../middleware/http-context.js";
import { add } from "lodash";
import { Library } from "src/data/collections/library.collection.js";
import { isValidLibrary } from "src/data/validation/library/is-valid-library.js";
import { hasLibraryAuth } from "src/data/validation/library/has-auth-library.js";
import { ConfirmResourceRequest } from "./validation/requests/confirm-resource.req.js";
import { ConfirmOnlineResourceRequest } from "./validation/requests/confirm-online-resource.req.js";
import { CreateLibraryRequest } from "./validation/requests/create-library.req.js";
import { ScrapeLibraryRequest } from "./validation/requests/scrape-library.req.js";

@Controller('/library')
@singleton()
export class LibraryController extends ControllerBase {
    constructor(
        @inject(MongoService) private mongo: MongoService,
        @inject(StorageService) private storage: StorageService,
        @inject(RagService) private rag: RagService
    ) {
        super();
    }

    @Post('/')
    @Validate(
        'body', {
            name: Joi.string().required(),
        }
    )
    public async addLibrary(req: Request, res: Response) {
        let addReq = req.body as CreateLibraryRequest;
        let userId = httpContext().userId ?? null;

        let library = {
            _id: new ObjectId(),
            name: addReq.name,
            pendingScrape: true,
            created: new Date()
        } as Library;
        await this.mongo.collections.library.insertOne(library);

        res.status(200).send({
            _libraryId: library._id,
            msg: "Library was successfully added."
        })
    }

    @Post('/scrape')
    @Validate(
        'body', {
            _libraryId: objectId.required(),
            embeddingModel: Joi.string().required()
        }
    )
    public async scrapeLibrary(req: Request, res: Response) {
        let scrapeReq = req.body as ScrapeLibraryRequest;
        let library = await this.mongo.collections.library.findOne({
            _id: new ObjectId(scrapeReq._libraryId)
        }).then(executeMongoChecks<Library>([
            isValidLibrary
        ]));

        let scrape = await this.rag.scrapeLibrary({
            library: library,
            embeddingModel: scrapeReq.embeddingModel
        })

        res.status(200).send({
            _scrapeId: scrape._id,
            msg: "Library was successfully scraped."
        })
    }

    @Post('/add/resource')
    @Validate(
        'body', {
            _libraryId: objectId.required(),
            path: Joi.string().required(),
            type: Joi.string().valid(...Object.values(ResourceType)).required()
        }
    )
    public async addResource(req: Request, res: Response) {
        let confirmReq = req.body as ConfirmResourceRequest;
        let library = await this.mongo.collections.library.findOne({
            _id: new ObjectId(confirmReq._libraryId)
        }).then(executeMongoChecks<Library>([
            isValidLibrary
        ]))

        // Add resource
        let resource = {
            _id: new ObjectId(),
            path: confirmReq.path,
            type: confirmReq.type,
            _libraryId: library._id,
            created: new Date()
        } as Resource
        await this.mongo.collections.resource.insertOne(resource)

        // Indicate library's current scrape is outdated.
        await this.mongo.collections.library.updateOne({
            _id: library._id
        }, {
            $set: {
                pendingScrape: true
            }
        })

        res.status(200).send({
            _resourceId: resource._id,
            msg: "Resource was succesfully added."
        });
    }

    @Post('/add/resource/online')
    @Validate(
        'body', {
            _libraryId: objectId.required(),
            url: Joi.string().required(),
            type: Joi.string().valid(...Object.values(OnlineResourceType)).required()
        }
    )
    public async addOnlineResource(req: Request, res: Response) {
        let confirmReq = req.body as ConfirmOnlineResourceRequest;
        let library = await this.mongo.collections.library.findOne({
            _id: new ObjectId(confirmReq._libraryId)
        }).then(executeMongoChecks<Library>([
            isValidLibrary
        ]))

        // Add resource
        let onlineResource = {
            _id: new ObjectId(),
            url: confirmReq.url,
            type: confirmReq.type,
            _libraryId: library._id,
            created: new Date()
        } as OnlineResource;
        await this.mongo.collections.onlineResource.insertOne(onlineResource);

        // Indicate library's current scrape is outdated.
        await this.mongo.collections.library.updateOne({
            _id: library._id
        }, {
            $set: {
                pendingScrape: true
            }
        })

        res.status(200).send({
            _onlineResourceId: onlineResource._id,
            msg: "Online resource was succesfully added."
        })
    }
}