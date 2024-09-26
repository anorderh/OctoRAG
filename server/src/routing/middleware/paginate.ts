import { NextFunction } from "express";
import { Middleware } from "src/utils/types/middleware.js";
import { Request, Response } from "express";
import { Pagination } from "src/utils/interfaces/pagination.js";
import { env } from "src/env.js";
import { PaginationLimitExceededError } from "src/error-handling/errors.js";
import { httpContext } from "./http-context.js";
import { InstanceDeps } from "src/utils/enums/instance-deps.js";
import { container } from "tsyringe";
import { Logger } from "pino";

export const paginate: Middleware = async function (req: Request, res: Response, next: NextFunction) {
    const logger = container.resolve<Logger>(InstanceDeps.Logger);
    
    try {
        let pag = {
            skip: Number(req.query?.skip ?? env.defaults.pagination.skip),
            limit: Number(req.query?.limit ?? env.defaults.pagination.limit)
        } as Pagination;
        if (pag.limit > env.defaults.pagination.maxLimit) {
            throw new PaginationLimitExceededError();
        }

        httpContext().pagination = pag;
        next();
    } catch (error: any) {
        if (error instanceof PaginationLimitExceededError) {
            res.status(400).send("Invalid pagination limit.");
            return;
        }

        logger.error({err: error});
        res.status(500).send();
    }
}