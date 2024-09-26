import { NextFunction, Request, Response } from "express";
import { Middleware } from '../../utils/types/middleware.js';
import { AuthService, MongoService } from '../../services/index.js';
import { container } from "tsyringe";
import { TokenType } from '../../utils/enums/token-type.js';
import jwt from 'jsonwebtoken';
import { UserService } from '../../services/user.service.js';
import { httpContext } from './http-context.js';
import { CollectionId } from '../../utils/enums/collection-id.js';
import { User } from '../../data/collections/index.js';
import { InstanceDeps } from '../../utils/enums/instance-deps.js';
import { Logger } from "pino";
import { ObjectId } from "mongodb";

export const authorize: Middleware = async function (req: Request, res: Response, next: NextFunction) {
    const authService = container.resolve(AuthService);
    const logger = container.resolve<Logger>(InstanceDeps.Logger);
    const mongoService = container.resolve(MongoService);
    const userCollection = mongoService.db.collection<User>(CollectionId.User);
    
    try {
        const hash = req.header('Authorization');
        const hashedToken = hash?.split(' ')[1];
        if (!hashedToken) {
            res.status(401).send("Missing access token");
            return;
        };

        const token = authService.deserialize(TokenType.Access, hashedToken);
        if (!token || token.type != TokenType.Access) {
            res.status(401).send("Invalid access token");
            return;
        }

        const user = await userCollection.findOne({
            _id: new ObjectId(token.userId)
        });
        if (!user) {
            res.status(409).send("User does not exist.");
            return;
        }

        httpContext().userId = user._id;
        next();
    } catch (error: any) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).send("Token expired.");
            return;
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).send("Malformed access token");
            return;
        }

        logger.error({err: error});
        res.status(500).send();
    }
}