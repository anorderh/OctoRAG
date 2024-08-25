import { NextFunction, Response, Request } from "express";
import { container } from "tsyringe";
import { InstanceDeps } from "../utils/enums/instance-deps";
import { Logger } from "pino";
import { ErrorHandler } from "../utils/types/error-handler";
import { CustomErrorBase } from "./error.base";

export const errorHandler : ErrorHandler = function (err: Error, req: Request, res: Response, next: NextFunction) {
    let logger = container.resolve<Logger>(InstanceDeps.Logger);
    logger.error({ err: err });

    if (err instanceof CustomErrorBase) {
        err.respond(res);
    } else {
        res.status(500).send({
            error: 'Internal Server Error Occurred'
        });
    }
}