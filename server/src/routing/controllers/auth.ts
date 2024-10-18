import { inject, injectable, singleton } from "tsyringe";

import { Get, Post, Delete, Patch, Controller, Middleware, Authorize } from '../decorators/index.js';
import { Request, Response, Router } from "express";
import { Blanket } from '../decorators/blanket.js';
import morgan from "morgan";
import { validateHeaderName } from "http";
import Joi from "joi";
import { Validate } from '../decorators/validate.js';
import { Collection, ObjectId } from "mongodb";
import { UserService } from "src/services/data/user.service.js";
import { MongoService } from "src/services/data/mongo.service.js";
import { User } from "src/data/collections/user.collection.js";
import { ControllerBase } from "../utils/abstract/controller.abstract.js";
import { CollectionId } from "src/data/utils/constants/collection-id.js";
import { TokenType } from "src/shared/utils/constants/token-type.js";
import { TokenPayload } from "src/shared/utils/constants/token-payload.js";
import { Token } from "src/shared/utils/interfaces/token.js";
import { TokenUtility } from "src/shared/utils/classes/token.util.js";
import { env } from "src/shared/utils/constants/env.js";

@Controller('/auth')
@singleton()
export class AuthController extends ControllerBase {
    userCollection: Collection<User>;
    
    constructor(
        @inject(UserService) private userService: UserService,
        @inject(MongoService) private mongo: MongoService,
    ) { 
        super();
        this.userCollection = this.mongo.db.collection<User>(CollectionId.User);
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
        // Check if user is already registered.
        let user = await this.userCollection.findOne({
            $or: [
                { email: req.body.email },
                { username: req.body.username }
            ]
        })
        if (!!user) {
            res.status(409).send("Username and/or email is already in use.");
            return;
        }

        // Create user.
        let insertResult = await this.userCollection.insertOne({
            _id: new ObjectId(),
            username: req.body.username,
            credentials: {
                email: req.body.email,
                password: await TokenUtility.hash(req.body.password)
            },
            pfpPath: "",
            desc: "",
        })
        let createdUser = (await this.userCollection.findOne({ _id: insertResult.insertedId })) as User;
        res.status(200).send(`Account "${createdUser.username}" registered.`);
    }

    @Post('/login')
    @Validate(
        'body', {
            username: Joi.string().required(),
            password: Joi.string().required(),
        }
    )
    async login(req: Request, res: Response) {
        // Validate credentials.
        let user = await this.userCollection.findOne({
            username: req.body.username 
        })
        if (user == null) {
            res.status(409).send("Invalid username.")
            return;
        } else if (!await TokenUtility.validate(req.body.password, user.credentials.password)) {
            res.status(409).send("Invalid password.")
            return;
        }

        // Generate refresh token for prolonged access.
        const refreshToken = TokenUtility.serialize({
            type: TokenType.Refresh, 
            userId: user._id
        });
        res.cookie(env.tokens.refresh.name, refreshToken, {
            httpOnly: true,
            secure: env.server.secure // Cookie security via HTTP/HTTPS
        });
        
        // Generate access token for immediate access.
        const accessToken = TokenUtility.serialize({
            type: TokenType.Access, 
            userId: user._id
        });
        res.status(200).send({
            msg: `Account "${user.username}" logged in.`,
            token: `Bearer ${accessToken}`
        });
    }

    @Get('/refresh')
    async refresh(req: Request, res: Response) {
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
        let token = TokenUtility.deserialize(TokenType.Refresh, currRefreshToken);
        if (!token) {
            res.status(401).send("Invalid refresh token");
            return;
        }
        const user = await this.userCollection.findOne({
            _id: new ObjectId(token.userId)
        });
        if (user == null) {
            res.status(409).send("Account does not exist");
            return;
        }

        // Generate new access token.
        let newAccessToken = TokenUtility.serialize({
            type: TokenType.Access, 
            userId: user._id
        });
        res.status(200).send({
            msg: `Account \"${user.username}\" authentication refreshed.`,
            token: `Bearer ${newAccessToken}`
        });
    }

    @Post("/request/change/password")
    @Validate(
        'body', {
            email: Joi.string().required()
        }
    )
    public async requestPasswordChange(req: Request, res: Response) {
        let email = req.body.email;
        let user = await this.userCollection.findOne({
            'credentials.email': email
        });

        let credentialHash;
        if (user != null) { // Allow the request to complete, even for invalid email addresses.
            let credentialToken = {
                type: TokenType.Verify,
                userId: user._id,
                payload: TokenPayload.ChangePassword
            } as Token;
            credentialHash = TokenUtility.serialize(credentialToken);

            // TODO - Send email.
        }

        res.status(200).send(
            // "Password change request attempted."
            { hash: credentialHash ?? "Faulty token" } // DEBUG: Provide hash in response to verify functionality.
        );
    }

    @Post("/request/change/password/confirm")
    @Validate(
        'body', {
            hash: Joi.string().required(),
            newPassword: Joi.string().required()
        }
    )
    public async confirmPasswordChange(req: Request, res: Response) {
        let {hash, newPassword} = req.body;

        let token = TokenUtility.deserialize(TokenType.Verify, hash);
        let user = await this.userCollection.findOne({
            _id: new ObjectId(token.userId)
        })
        if (
            token.payload != TokenPayload.ChangePassword
            || user == null
        ) {
            res.status(400).send("Malformed token");
            return;
        }

        let newPasswordHash = await TokenUtility.hash(newPassword);
        await this.userCollection.updateOne({
            _id: new ObjectId(token.userId)
        }, {
            $set: {
                "credentials.password": newPasswordHash
            }
        });
        res.status(200).send("Password succesfully updated.")
    }

    @Post("/request/change/email")
    @Authorize()
    public async requestEmailChange(req: Request, res: Response) {
        let self = await this.userService.getSelf();
        let credentialToken = {
            type: TokenType.Verify,
            userId: self._id,
            payload: TokenPayload.ChangeEmail
        } as Token;
        let credentialHash = TokenUtility.serialize(credentialToken);
        // TODO - Send email.

        res.status(200).send(
            // "Email change request attempted."
            { hash: credentialHash ?? "Faulty token" } // DEBUG: Provide hash in response to verify functionality.
        );
    }

    @Post("/request/change/email/confirm")
    @Authorize()
    @Validate(
        'body', {
            hash: Joi.string().required(),
            newEmail: Joi.string().required()
        }
    )
    public async confirmEmailChange(req: Request, res: Response) {
        let {hash, newEmail} = req.body;

        let user = await this.userService.getSelf();
        let token = TokenUtility.deserialize(TokenType.Verify, hash);
        if (
            token.payload != TokenPayload.ChangeEmail
            || user._id != token.userId
        ) {
            res.status(400).send("Malformed token");
            return;
        }

        await this.userCollection.updateOne({
            _id: new ObjectId(token.userId)
        }, {
            $set: {
                "credentials.email": newEmail
            }
        });
        res.status(200).send("Email succesfully updated.")
    }

    @Post("/request/deletion")
    @Authorize()
    public async requestDeletion(req: Request, res: Response) {
        let self = await this.userService.getSelf();
        let credentialToken = {
            type: TokenType.Verify,
            userId: self._id,
            payload: TokenPayload.DeleteAccount
        } as Token;
        let credentialHash = TokenUtility.serialize(credentialToken);
        // TODO - Send email.

        res.status(200).send(
            // "Deletion request attempted."
            { hash: credentialHash ?? "Faulty token" } // DEBUG: Provide hash in response to verify functionality.
        );
    }

    @Post("/request/deletion/confirm")
    @Authorize()
    @Validate(
        'body', {
            hash: Joi.string().required()
        }
    )
    public async confirmDeletion(req: Request, res: Response) {
        let {hash} = req.body;

        let user = await this.userService.getSelf();
        let token = TokenUtility.deserialize(TokenType.Verify, hash);
        if (
            token.payload != TokenPayload.DeleteAccount
            || user._id != token.userId
        ) {
            res.status(400).send("Malformed token");
            return;
        }

        await this.userCollection.deleteOne({
            _id: user._id
        });
        res.status(200).send("Account succesfully deleted.")
    }
}