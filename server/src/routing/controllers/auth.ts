import { inject, injectable, singleton } from "tsyringe";
import { AuthService } from "../../services";
import { Get, Post, Delete, Patch, Controller, Middleware } from "../decorators";
import { middleware } from "../middleware/register";
import { Request, Response, Router } from "express";
import { Account } from "../../data/models";
import { AccountStatus } from "../../utils/enums/account-status.enum";
import { ControllerBase } from "../../utils/abstract/controller";

@Controller('/auth')
@singleton()
export class AuthController extends ControllerBase {
    _authService: AuthService;

    constructor(
        @inject(AuthService) authService: AuthService
    ) { 
        super();
        this._authService = authService;
    }

    @Get('/register')
    @Middleware(middleware.register)
    async register(req: Request, res: Response) {
        try {            
            const currUser = await Account.exists({
                $or: [
                    { email: req.body.email },
                    { username: req.body.username }
                ]
            });
            if (currUser) {
                res.status(409).send("Username and/or email is already in use.")
            }
    
            const newUser = await Account.create({
                username: req.body.username,
                email: req.body.hash,
                password: this._authService.hash(req.body.password),
                status: AccountStatus.Pending,
            });
            res.status(200).send(`User \"${newUser.username}\" setup successfully.`);
        } catch(error: any) {
            res.status(500).json({
                message: error.message
            });
        }
    }
}