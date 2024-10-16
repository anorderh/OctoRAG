import { NextFunction } from "express";
import { Request, Response } from "express";
import { PaginationLimitExceededError } from "src/error-handling/errors.js";
import { httpContext } from "./http-context.js";
import { container } from "tsyringe";
import { Logger } from "pino";
import { Middleware } from "../utils/types/middleware.js";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token.js";
import { env } from "src/shared/utils/constants/env.js";
import { Pagination } from "../utils/interfaces/pagination.js";
import { App } from "src/App.js";

export const paginate: Middleware = async function (req: Request, res: Response, next: NextFunction) {    
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

        App.logger.error({err: error});
        res.status(500).send();
    }
}