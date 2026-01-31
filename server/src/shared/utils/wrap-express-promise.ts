import { NextFunction, Request, Response } from 'express';
import { Route } from 'src/controllers/shared/types/route';

export function wrapExpressPromise(method: Route) {
    return (req: Request, res: Response, next: NextFunction) => {
        return Promise.resolve()
            .then(async () => {
                await method(req, res);
            })
            .catch(next);
    };
}
