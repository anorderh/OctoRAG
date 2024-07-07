import { inject, injectable } from "tsyringe";
import { MongoService } from "../services/mongo.service";
import { Router } from "express";
import { Controller } from "../utils/interfaces/controller";
import { Dictionary } from "lodash";
import { Request, Response } from "express";

@injectable()
export class AuthController extends Controller {
    mongo: MongoService;

    constructor(@inject(MongoService) private _mongo: MongoService) {
        super();
        this.mongo = _mongo;
    }

    buildRouter() {
        let router = Router();

        router.route('auth/hello')
            .get((req: Request, res: Response) => {
                console.log("Hello");
            })

        return router;
    }
}