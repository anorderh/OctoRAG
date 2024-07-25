import { NextFunction, Request, Response } from "express";
import { RequestProp } from "../types/request-prop";
import Joi from "joi";

export function createJoiMiddleware(
    appliedProp : RequestProp,
    schema: Joi.ObjectSchema // Apply validation to body if not specified.
) {
    return (req: Request, res: Response, next: NextFunction) => {
        const {error} = schema.validate(req[appliedProp]);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        
        next();
    }
}