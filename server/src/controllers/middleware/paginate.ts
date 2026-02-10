import { NextFunction, Request, Response } from 'express';
import { App } from 'src/core/App.js';
import { PaginationLimitExceededError } from 'src/shared/classes/errors.js';
import { env } from 'src/shared/constants/env.js';
import { Pagination } from '../shared/interfaces/pagination.js';
import { Middleware } from '../shared/types/middleware.js';
import { httpContext } from './http-context.js';

export const paginate: Middleware = async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        let pag = {
            skip: Number(req.query?.skip ?? env.defaults.pagination.skip),
            limit: Number(req.query?.limit ?? env.defaults.pagination.limit),
        } as Pagination;
        if (pag.limit > env.defaults.pagination.maxLimit) {
            throw new PaginationLimitExceededError();
        }

        httpContext().pagination = pag;
        next();
    } catch (error: any) {
        if (error instanceof PaginationLimitExceededError) {
            res.status(400).send('Invalid pagination limit.');
            return;
        }

        App.logger.error({ err: error });
        res.status(500).send();
    }
};
