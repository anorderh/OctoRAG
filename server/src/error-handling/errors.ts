import { CustomErrorBase } from './utils/abstract/error.base.js';
import { env } from 'src/shared/utils/constants/env.js';
import { ErrorParams } from './utils/types/error-params.js';

export class InvalidTokenTypeError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 404,
            body: params?.body ?? "Invalid token provided."
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

export class PuppeteerPageNotRecognizedError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 406,
            body: params?.body ?? 'Attempting to navigate to the associated URL yielded an HTTP error code.'
        });
    }
}

export class InvalidURLFormatError extends CustomErrorBase {
    constructor(params?: ErrorParams) {
        super({
            status: params?.status ?? 406,
            body: params?.body ?? "The resource's associated URL did not match its type's required formatting."
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