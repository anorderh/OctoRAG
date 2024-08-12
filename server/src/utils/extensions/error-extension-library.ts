import { Response } from "express";

export type CustomErrorHandler = (res: Response, error: Error) => void;

// Supported errors.
export class InvalidTokenTypeError extends Error {}
export class InvalidBoardAccessError extends Error {}

// Unsupported errors.
export class MissingCustomDependencyHandler extends Error {}

export class ErrorExtensionLibrary {
    private static dict: {[key: string]: CustomErrorHandler} = {
        [typeof InvalidTokenTypeError]: (res, err) => {
            res.status(403).send("Invalid token.");
        },
        [typeof InvalidBoardAccessError]: (res, err) => {
            res.status(409).send(err.message);            
        }
    }

    public static has(input: Error) {
        return this.dict[typeof input] != null;
    }

    public static get(input: Error) {
        return this.dict[typeof input];
    }
}