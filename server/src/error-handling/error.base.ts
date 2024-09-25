import { Response } from "express";
import { ErrorParams } from "./error-params";

export abstract class CustomErrorBase extends Error {
    public status: number = 500;
    public body: any = "Undefined custom error occurred."
    public cause?: any;

    constructor(params?: ErrorParams) {
        super()
        this.status = params?.status ?? this.status;
        this.body = params?.body ?? this.body;
    }
    
    public respond(res: Response) {
        res.status(this.status).send(this.body);
    }
}