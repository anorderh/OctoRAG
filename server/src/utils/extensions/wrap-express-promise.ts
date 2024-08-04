import { Request, Response, NextFunction } from "express";

export function wrapExpressPromise(method: Function) {
    return async (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve().then(async () => {
            await method;
        }).catch(next);
    }
}