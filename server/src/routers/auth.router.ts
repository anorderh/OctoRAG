import { container, inject, injectable } from "tsyringe";
import { MongoService } from "../services/mongo.service";
import { Router } from "express";
import { Request, Response } from "express";
import Joi from "joi";
import { createJoiMiddleware } from "../utils/extensions/joi-middleware";
import { Account, AccountInfo, AccountRequest, AccountStats } from "../data/schema";
import { AuthService } from "../services";
import { AccountStatus } from "../utils/enums/account-status.enum";
import { env } from "../env";

// Services.
const authService: AuthService = container.resolve(AuthService);
const authRouter: Router = Router();

authRouter.route("/auth/signUp")
    .get([
        createJoiMiddleware(
            Joi.object({
                username: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().required(),
            })
        )
    ], async (req: Request, res: Response) => {
        try {
            const currUser = await Account.exists({
                $or: [
                    { email: req.body.email },
                    { username: req.body.username }
                ]
            });
            if (currUser) {
                res.status(409).send("User already exists.")
            }

            const newUser = await (new Account({
                username: req.body.username,
                email: req.body.hash,
                password: authService.hash(req.body.password),
                status: AccountStatus.Pending,
            })).save();
            const token = authService.createToken(newUser._id);
            res.cookie(env.server.jwtKeyName, token, {
                path: "/",
                secure: true,
                httpOnly: true, 
            });
            
            res.status(200).send("User setup successfully.");
        } catch(error: any) {
            res.status(500).json({
                message: error.message
            });
        }
    }
    );

export default authRouter;