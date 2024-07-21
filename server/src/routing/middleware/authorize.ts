import { NextFunction, Request, Response } from "express";
import { Middleware } from "../../utils/types/middleware";
import { AuthService } from "../../services";
import { container } from "tsyringe";
import { TokenType } from "../../utils/enums/token-type";
import { Account } from "../../data/models";
import { LogService } from "../../services/log.service";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export const authorize: Middleware = async function (req: Request, res: Response, next: NextFunction) {
    const authService = container.resolve(AuthService);
    const logService = container.resolve(LogService);
    
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

        const user = await Account.findOne({
            _id: token.accountId
        });
        if (!user) {
            res.status(409).send("Account does not exist.");
            return;
        }

        next();
    } catch (error: any) {
        if (error instanceof TokenExpiredError) {
            res.status(401).send("Token expired.");
            return;
        } else if (error instanceof JsonWebTokenError) {
            res.status(401).send("Malformed access token");
            return;
        }

        logService.error(error);
        res.status(540).send();
    }
}