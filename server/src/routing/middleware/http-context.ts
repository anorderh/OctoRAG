import { AsyncLocalStorage } from "async_hooks";
import { NextFunction, Request } from "express";
import { HttpContext } from "../../utils/interfaces/http-context";

export const storage = new AsyncLocalStorage<HttpContext>();
export const httpContext = () : HttpContext => storage.getStore()!;

export const useHttpContext = function (req: Request, res: Response, next: NextFunction) {
    storage.run({} as HttpContext, () => {
        next();
    })
}