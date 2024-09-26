import { CustomErrorBase } from './error.base.js';
import { env } from '../env.js';
import { ErrorParams } from './error-params.js';

export class InvalidTokenTypeError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 404,
            body: params?.body ?? "Invalid token provided."
        });

    }
}

export class InvalidBoardError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 409,
            body: params?.body ?? "Invalid board specified"
        });
    }
}

export class InvalidUserError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 409,
            body: params?.body ?? "Invalid user specified"
        });
    }
}

export class PaginationLimitExceededError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 400,
            body: params?.body ?? `Pagination max of ${env.defaults.pagination.maxLimit} exceeded.`
        });
    }
}

export class JoiValidationMiddlewareError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 400,
            body: params?.body ?? 'Joi validation error occurred'
        });
    }
}

export class UnsupportedFindTypeError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 501,
            body: params?.body ?? 'The identified Find type is not supported for processing.'
        });
    }
}

export class PuppeteerPageNotRecognizedError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 406,
            body: params?.body ?? 'Attempting to navigate to the associated URL yielded an HTTP error code.'
        });
    }
}

export class InvalidFindLinkFormatError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 406,
            body: params?.body ?? "The find's associated link did not match its type's required formatting."
        });
    }
}

export class FailedGitRepoDownloadError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 502,
            body: params?.body ?? "The .ZIP file associated w/ the requested Git repository could not be downloaded."
        });
    }
}

export class CustomTimeoutError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 504,
            body: params?.body ?? "A server action acting as a gateway timed out."
        });
    }
}

export class InvalidRagSessionRequest extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 409,
            body: params?.body ?? "The requested session does not exist."
        });
    }
}

export class InvalidVectorIndexError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 409,
            body: params?.body ?? "The requested vector index does not exist. Please refresh the chat."
        });
    }
}

export class ScrapeEntryFailedError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 502,
            body: params?.body ?? "The associated content scrape failed to complete."
        });
    }
}

export class UnsupportedError extends CustomErrorBase {}