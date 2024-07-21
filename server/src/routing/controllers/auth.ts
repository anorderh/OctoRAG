import { inject, injectable, singleton } from "tsyringe";
import { AuthService } from "../../services";
import { Get, Post, Delete, Patch, Controller, Middleware } from "../decorators";
import { validation } from "../middleware/validation";
import { Request, Response, Router } from "express";
import { Account } from "../../data/models";
import { ControllerBase } from "../../utils/abstract/controller";
import { env } from "../../env";
import { Token } from "../../utils/interfaces/token";
import { TokenType } from "../../utils/enums/token-type";
import { Blanket } from "../decorators/blanket";
import morgan from "morgan";
import { LogService } from "../../services/log.service";

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
    @Middleware(validation.register)
    async register(req: Request, res: Response) {
        try {
            // Ensure user credentials are not already being used.   
            const currUser = await Account.exists({
                $or: [
                    { email: req.body.email },
                    { username: req.body.username }
                ]
            });
            if (currUser) {
                res.status(409).send("Username and/or email is already in use.");
                return;
            }

            // Create user.  
            const newUser = await Account.create({
                username: req.body.username,
                email: req.body.email,
                password: await this.authService.hash(req.body.password)
            });            
            res.status(200).send(`User ${newUser.username} registered.`);
        } catch(error: any) {
            this.logService.error(error);
            res.status(500).send();
        }
    }

    @Post('/login')
    @Middleware(validation.login)
    async login(req: Request, res: Response) {
        try {
            // Validate credentials.
            const user = await Account.findOne({
                username: req.body.username
            });
            if (!user) {
                res.status(409).send("Invalid username.")
                return;
            }
            if (!await this.authService.validate(req.body.password, user.password)) {
                res.status(409).send("Invalid password.")
                return;
            }

            // Genreate tokens.
            const accessToken = this.authService.serialize({
                type: TokenType.Access,
                accountId: user.id
            } as Token);

            const refreshToken = this.authService.serialize({
                type: TokenType.Refresh,
                accountId: user.id
            } as Token);
            res.cookie(env.tokens.refresh.name, refreshToken, {
                httpOnly: true,
                secure: true
            });
            
            res.status(200).send({
                msg: `User \"${user!.username}\" logged in.`,
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
                res.status(400).send()
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
            const user = await Account.findOne({
                _id: token!.accountId
            });
            if (!user) {
                res.status(409).send("Account does not exist");
                return;
            }

            // Generate new access token.
            let newAccessToken = this.authService.serialize({
                type: TokenType.Access,
                accountId: user.id
            } as Token);
            res.status(200).send({
                msg: `User \"${user!.username}\" authentication refreshed.`,
                token: `Bearer ${newAccessToken}`
            });
        } catch (error: any) {
            this.logService.error(error);
            res.status(500).send();
        }
    }
}