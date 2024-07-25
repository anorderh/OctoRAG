import { Request } from "express";
import { Pagination } from "../interfaces/pagination";
import { env } from "../../env";

export function usePagination(req: Request) : Pagination {
    return {
        skip: Number(req.query?.skip ?? env.defaults.pagination.skip),
        limit: Number(req.query?.limit ?? env.defaults.pagination.limit)
    } as Pagination;
}