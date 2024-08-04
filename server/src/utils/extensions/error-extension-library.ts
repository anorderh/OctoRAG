import { Response } from "express";

export type CustomErrorHandler = (res: Response) => void;

export class InvalidTokenTypeError extends Error {}

export class ErrorExtensionLibrary {
    private static dict: {[key: string]: CustomErrorHandler} = {
        [typeof InvalidTokenTypeError]: (res) => {
            res.status(403).send("Invalid token.");
        }
    }

    public static has(input: Error) {
        return this.dict[typeof input] != null;
    }

    public static get(input: Error) {
        return this.dict[typeof input];
    }
}