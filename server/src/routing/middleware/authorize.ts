import { NextFunction, Request, Response } from "express";
import { Middleware } from "../../utils/types/middleware";
import { AuthService, MongoService } from "../../services";
import { container } from "tsyringe";
import { TokenType } from "../../utils/enums/token-type";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { UserService } from "../../services/user.service";
import { httpContext } from "./http-context";
import { CollectionId } from "../../utils/enums/collection-id";
import { User } from "../../data/collections";
import { InstanceDeps } from "../../utils/enums/instance-deps";
import { Logger } from "pino";

export const authorize: Middleware = async function (req: Request, res: Response, next: NextFunction) {
    const authService = container.resolve(AuthService);
    const logger = container.resolve<Logger>(InstanceDeps.Logger);
    const mongoService = container.resolve(MongoService);

    const userCollection = await mongoService.db.createCollection<User>(CollectionId.User);
    
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
            _id: token.userId
        });
        if (!user) {
            res.status(409).send("User does not exist.");
            return;
        }

        httpContext().userId = user._id;
        next();
    } catch (error: any) {
        if (error instanceof TokenExpiredError) {
            res.status(401).send("Token expired.");
            return;
        } else if (error instanceof JsonWebTokenError) {
            res.status(401).send("Malformed access token");
            return;
        }

        logger.error({err: error});
        res.status(540).send();
    }
}