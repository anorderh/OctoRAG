import { CustomErrorBase } from "./error.base";
import { env } from "../env";

export class InvalidTokenTypeError extends CustomErrorBase {
    public status = 404;
    public body = "Invalid token provided.";
}

export class InvalidBoardError extends CustomErrorBase {
    public status = 409;
    public body = "Invalid board specified";
}

export class InvalidUserError extends CustomErrorBase {
    public status = 409;
    public body = "Invalid user specified";
}

export class PaginationLimitExceededError extends CustomErrorBase {
    public status = 400;
    public body = `Pagination max of ${env.defaults.pagination.maxLimit} exceeded.`
}

export class JoiValidationMiddlewareError extends CustomErrorBase {
    public status = 400;
    public body = 'Joi validation error occurred'
}

export class UnsupportedError extends CustomErrorBase {}