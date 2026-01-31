import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { RequestProp } from 'src/controllers/shared/types/request-prop.js';
import { JoiValidationMiddlewareError } from 'src/shared/classes/errors.js';

export function createJoiMiddleware(
    appliedProp: RequestProp,
    schema: Joi.ObjectSchema, // Apply validation to body if not specified.
) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { value, error } = schema.validate(req[appliedProp]);
        if (error) {
            let errorMsg = error.details[0].message;
            throw new JoiValidationMiddlewareError({
                body: `Joi validation error occurred: "${errorMsg}"`,
            });
        }

        req[appliedProp] = value; // Reapply prop w/ Joi validation.
        next();
    };
}
