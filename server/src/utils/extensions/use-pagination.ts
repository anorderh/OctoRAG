import { Request } from "express";
import { Pagination } from "../interfaces/pagination";
import { env } from "../../env";
import { PaginationLimitExceededError } from "../../error-handling/errors";

export function usePagination(req: Request) : Pagination {
    let pag = {
        skip: Number(req.query?.skip ?? env.defaults.pagination.skip),
        limit: Number(req.query?.limit ?? env.defaults.pagination.limit)
    } as Pagination;
    
    if (pag.limit > env.defaults.pagination.maxLimit) {
        throw new PaginationLimitExceededError();
    }

    return pag;
}