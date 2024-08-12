import { NextFunction, Response, Request } from "express";
import { container } from "tsyringe";
import { ErrorExtensionLibrary } from "../../utils/extensions/error-extension-library";
import { InstanceDeps } from "../../utils/enums/instance-deps";
import { Logger } from "pino";

export const errorHandler = async function (err: Error, req: Request, res: Response, next: NextFunction) {
    let logger = container.resolve<Logger>(InstanceDeps.Logger);
    logger.error({ err: err });

    let customHandler = ErrorExtensionLibrary.get(err);
    if (!!customHandler) {
        customHandler(res, err);
    } else {
        res.status(500).send({
            error: 'Internal Server Error Occurred'
        });
    }
}