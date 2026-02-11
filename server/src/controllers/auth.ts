import { inject, singleton } from 'tsyringe';

import { Request, Response } from 'express';
import Joi from 'joi';
import { Collection, ObjectId } from 'mongodb';
import { User, UserEntity } from 'src/database/entities/user/user.js';
import { CollectionId } from 'src/database/shared/constants/collection-id.js';
import { MongoService } from 'src/services/mongo.service.js';
import { UserService } from 'src/services/user.service.js';
import { TokenUtility } from 'src/shared/classes/token.util.js';
import { env } from 'src/shared/constants/env.js';
import { TokenType } from 'src/shared/constants/token-type.js';
import { Controller, Get, Post } from '../controllers/decorators/index.js';
import { Validate } from './decorators/validate.js';
import { ControllerBase } from './shared/abstract/controller.abstract.js';
import { ControllerResponse } from './shared/interfaces/controller-response.js';

@Controller('/auth')
@singleton()
export class AuthController extends ControllerBase {
    userCollection: Collection<UserEntity>;

    constructor(
        @inject(UserService) private userService: UserService,
        @inject(MongoService) private mongo: MongoService,
    ) {
        super();
        this.userCollection = this.mongo.db.collection<UserEntity>(
            CollectionId.User,
        );
    }

    @Post('/register')
    @Validate('body', {
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    })
    async register(req: Request, res: Response) {
        // Check if user is already registered.
        let user = await this.userCollection.findOne({
            $or: [{ email: req.body.email }, { username: req.body.username }],
        });
        if (!!user) {
            res.status(409).send('Username and/or email is already in use.');
            return;
        }

        // Create user.
        let hashedPassword = await TokenUtility.hash(req.body.password);
        let insertResult = await this.userCollection.insertOne({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
        let createdUser = (await this.userCollection.findOne({
            _id: insertResult.insertedId,
        })) as User;
        res.status(200).send({
            message: `User registered successfully`,
        } satisfies ControllerResponse);
    }

    @Post('/login')
    @Validate('body', {
        username: Joi.string().required(),
        password: Joi.string().required(),
    })
    async login(req: Request, res: Response) {
        // Validate credentials.
        let user = await this.userCollection.findOne({
            username: req.body.username,
        });
        if (user == null) {
            res.status(409).send('Invalid username.');
            return;
        } else if (
            !(await TokenUtility.validate(req.body.password, user.password))
        ) {
            res.status(409).send('Invalid password.');
            return;
        }

        // Generate refresh token for prolonged access.
        const refreshToken = TokenUtility.serialize({
            type: TokenType.Refresh,
            userId: user._id,
        });
        res.cookie(env.tokens.refresh.name, refreshToken, {
            httpOnly: true,
            secure: env.server.secure, // Cookie security via HTTP/HTTPS
        });

        // Generate access token for immediate access.
        const accessToken = TokenUtility.serialize({
            type: TokenType.Access,
            userId: user._id,
        });
        res.status(200).send({
            message: `Account "${user.username}" logged in.`,
            data: {
                token: `Bearer ${accessToken}`,
            },
        } satisfies ControllerResponse);
    }

    @Get('/refresh')
    async refresh(req: Request, res: Response) {
        // Validate refresh token & associated account.
        if (!req.cookies) {
            res.status(400).send();
            return;
        }
        let currRefreshToken: string | undefined =
            req.cookies[env.tokens.refresh.name];
        if (currRefreshToken == undefined) {
            res.status(401).send('Missing refresh token.');
            return;
        }
        let token = TokenUtility.deserialize(
            TokenType.Refresh,
            currRefreshToken,
        );
        if (!token) {
            res.status(401).send('Invalid refresh token');
            return;
        }
        const user = await this.userCollection.findOne({
            _id: new ObjectId(token.userId),
        });
        if (user == null) {
            res.status(409).send('Account does not exist');
            return;
        }

        // Generate new access token.
        let newAccessToken = TokenUtility.serialize({
            type: TokenType.Access,
            userId: user._id,
        });
        res.status(200).send({
            message: `Account \"${user.username}\" authentication refreshed.`,
            data: {
                token: `Bearer ${newAccessToken}`,
            },
        } satisfies ControllerResponse);
    }
}
