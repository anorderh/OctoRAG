import { Response } from 'express';

export type SuccessResponse<T = unknown> = Response<{
    message: string;
    data?: T | undefined;
}>;

export type ErrorResponse = Response<{
    message: string;
    error?: unknown | undefined;
}>;

export type ControllerResponse<T = unknown> =
    | SuccessResponse<T>
    | ErrorResponse;
