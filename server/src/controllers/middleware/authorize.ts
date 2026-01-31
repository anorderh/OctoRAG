import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { App } from 'src/App.js';
import { User } from 'src/data/collections/user.collection.js';
import { CollectionId } from 'src/data/utils/constants/collection-id.js';
import { MongoService } from 'src/services/mongo.service.js';
import { TokenType } from 'src/shared/constants/token-type.js';
import { TokenUtility } from 'src/shared/utils/classes/token.util.js';
import { container } from 'tsyringe';
import { Middleware } from '../shared/types/middleware.js';
import { httpContext } from './http-context.js';

export const authorize: Middleware = async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const mongoService = container.resolve(MongoService);
    const userCollection = mongoService.db.collection<User>(CollectionId.User);

    try {
        const hash = req.header('Authorization');
        const hashedToken = hash?.split(' ')[1];
        if (!hashedToken) {
            res.status(401).send('Missing access token');
            return;
        }

        const token = TokenUtility.deserialize(TokenType.Access, hashedToken);
        if (!token || token.type != TokenType.Access) {
            res.status(401).send('Invalid access token');
            return;
        }

        const user = await userCollection.findOne({
            _id: new ObjectId(token.userId),
        });
        if (!user) {
            res.status(409).send('User does not exist.');
            return;
        }

        httpContext().userId = user._id;
        next();
    } catch (error: any) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).send('Token expired.');
            return;
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).send('Malformed access token');
            return;
        }

        App.logger.error({ err: error });
        res.status(500).send();
    }
};
