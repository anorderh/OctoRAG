import { container, inject, injectable } from "tsyringe";
import { MongoService } from "../services/mongo.service";
import { Router } from "express";
import { Request, Response } from "express";

// Services.
const mongo: MongoService = container.resolve(MongoService);

const authRouter: Router = Router();

authRouter.route("/hello")
    .get(async (req: Request, res: Response) => {
        try {
            console.log("hello");
            res.status(200).send();
        } catch(error: any) {
            res.status(500).json({
                message: error.message
            });
        }
    });

export default authRouter;