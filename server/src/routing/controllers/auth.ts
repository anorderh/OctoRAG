import { inject, injectable, singleton } from "tsyringe";
import { AuthService } from "../../services";
import { Get, Post, Delete, Patch, Controller, Middleware } from "../decorators";
import { Request, Response, Router } from "express";
import { Account, User } from "../../data/models";
import { ControllerBase } from "../../utils/abstract/controller";
import { env } from "../../env";
import { Token } from "../../utils/interfaces/token";
import { TokenType } from "../../utils/enums/token-type";
import { Blanket } from "../decorators/blanket";
import morgan from "morgan";
import { LogService } from "../../services/log.service";
import { validateHeaderName } from "http";
import Joi from "joi";
import { Validate } from "../decorators/validate";

@Controller('/auth')
@Blanket([
    morgan('common'),
])
@singleton()
export class AuthController extends ControllerBase {
    constructor(
        @inject(AuthService) private authService: AuthService,
        @inject(LogService) private logService: LogService
    ) { 
        super();
    }

    @Post('/register')
    @Validate(
        'body', {
            username: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        }
    )   
    async register(req: Request, res: Response) {
        try {
            // Ensure account credentials are not already being used.   
            const currAccount = await Account.exists({
                $or: [
                    { email: req.body.email },
                    { username: req.body.username }
                ]
            }).exec();
            if (currAccount) {
                res.status(409).send("Username and/or email is already in use.");
                return;
            }

            // Create account & user records.
            const account = await Account.create({
                username: req.body.username,
                email: req.body.email,
                password: await this.authService.hash(req.body.password)
            });
            const user = await User.create({
                username: req.body.username,
                accountId: account.id
            })
            res.status(200).send(`Account "${account.username}" registered.`);
        } catch(error: any) {
            this.logService.error(error);
            res.status(500).send();
        }
    }

    @Post('/login')
    @Validate(
        'body', {
            username: Joi.string().required(),
            password: Joi.string().required(),
        }
    )
    async login(req: Request, res: Response) {
        try {
            // Validate credentials.
            const account = await Account.findOne({
                username: req.body.username
            }).exec();
            if (!account) {
                res.status(409).send("Invalid username.")
                return;
            }
            if (!await this.authService.validate(req.body.password, account.password)) {
                res.status(409).send("Invalid password.")
                return;
            }

            // Genreate tokens.
            const accessToken = this.authService.serialize({
                type: TokenType.Access,
                accountId: account.id
            } as Token);

            const refreshToken = this.authService.serialize({
                type: TokenType.Refresh,
                accountId: account.id
            } as Token);
            res.cookie(env.tokens.refresh.name, refreshToken, {
                httpOnly: true,
                secure: true
            });
            
            res.status(200).send({
                msg: `Account "${account!.username}" logged in.`,
                token: `Bearer ${accessToken}`
            });
        } catch (error: any) {
            this.logService.error(error);
            res.status(500).send();
        }
    }

    @Get('/refresh')
    async refresh(req: Request, res: Response) {
        try {
            // Validate refresh token & associated account.
            if (!req.cookies) {
                res.status(400).send();
                return;
            }
            let currRefreshToken : string | undefined = req.cookies[env.tokens.refresh.name];
            if (currRefreshToken == undefined) {
                res.status(401).send("Missing refresh token.");
                return;
            }
            let token = this.authService.deserialize(TokenType.Refresh, currRefreshToken);
            if (!token) {
                res.status(401).send("Invalid refresh token");
                return;
            }
            const account = await Account.findOne({
                _id: token!.accountId
            }).exec();
            if (!account) {
                res.status(409).send("Account does not exist");
                return;
            }

            // Generate new access token.
            let newAccessToken = this.authService.serialize({
                type: TokenType.Access,
                accountId: account.id
            } as Token);
            res.status(200).send({
                msg: `Account \"${account!.username}\" authentication refreshed.`,
                token: `Bearer ${newAccessToken}`
            });
        } catch (error: any) {
            this.logService.error(error);
            res.status(error.status500).send();
        }
    }
}