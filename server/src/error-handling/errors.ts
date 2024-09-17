import { CustomErrorBase } from './error.base';
import { env } from '../env';

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

export class UnsupportedFindTypeError extends CustomErrorBase {
    public status = 501;
    public body = 'The identified Find type is not supported for processing.'
}

export class PuppeteerPageNotRecognizedError extends CustomErrorBase {
    public status = 406;
    public body = 'Attempting to navigate to the associated URL yielded an HTTP error code.'
}

export class InvalidFindLinkFormatError extends CustomErrorBase {
    public status = 406;
    public body = "The find's associated link did not match its type's required formatting."
}

export class FailedGitRepoDownloadError extends CustomErrorBase {
    public status = 502;
    public body = "The .ZIP file associated w/ the requested Git repository could not be downloaded."
}

export class CustomTimeoutError extends CustomErrorBase {
    public status = 504;
    public body = "A server action acting as a gateway timed out."
}

export class InvalidRagSessionRequest extends CustomErrorBase {
    public status = 409;
    public body = "The requested session does not exist."
}

export class InvalidVectorIndexError extends CustomErrorBase {
    public status = 409;
    public body = "The requested vector index does not exist. Please refresh the chat."
}

export class UnsupportedError extends CustomErrorBase {}