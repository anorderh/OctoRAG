import { NextFunction, Request, Response } from 'express';
import { App } from 'src/App.js';
import { CustomErrorBase } from '../../services/shared/abstract/error.base.js';
import { ErrorHandler } from '../../services/shared/types/error-handler.js';

export const errorHandler: ErrorHandler = async function (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    App.logger.error({ err: err });

    if (err instanceof CustomErrorBase) {
        err.respond(res);
    } else {
        res.status(500).send({
            error: 'Internal Server Error Occurred',
        });
    }
};
