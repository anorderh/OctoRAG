import { NextFunction, Response, Request } from "express";
import { LogService } from "../../services";
import { container } from "tsyringe";
import { ErrorExtensionLibrary } from "../../utils/extensions/error-extension-library";

export const errorHandler = async function (err: Error, req: Request, res: Response, next: NextFunction) {
    let logService = container.resolve(LogService);
    logService.error(err.stack);

    let customHandler = ErrorExtensionLibrary.get(err);
    if (!!customHandler) {
        customHandler(res);
    } else {
        res.status(500).send({
            error: 'Internal Server Error Occurred'
        });
    }
}