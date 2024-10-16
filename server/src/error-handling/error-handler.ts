import { NextFunction, Response, Request } from "express";
import { container } from "tsyringe";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token.js";
import { Logger } from "pino";
import { ErrorHandler } from "./utils/types/error-handler.js";
import { CustomErrorBase } from './utils/abstract/error.base.js';
import { App } from "src/App.js";

export const errorHandler : ErrorHandler = async function (err: Error, req: Request, res: Response, next: NextFunction) {
    App.logger.error({ err: err });

    if (err instanceof CustomErrorBase) {
        err.respond(res);
    } else {
        res.status(500).send({
            error: 'Internal Server Error Occurred'
        });
    }
}