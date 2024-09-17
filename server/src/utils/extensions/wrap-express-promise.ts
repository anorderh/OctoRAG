import { Request, Response, NextFunction } from "express";
import { Route } from '../types/route';

export function wrapExpressPromise(method: Route) {
    return (req: Request, res: Response, next: NextFunction) => {
        return Promise.resolve().then(async () => {
            await method(req, res)
        }).catch(next)
    }
}