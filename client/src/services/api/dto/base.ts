export interface ClientSuccessResponse<T = unknown> {
    success: true;
    message: string;
    data: T | null;
}

export interface ClientErrorResponse {
    success: false;
    message: string;
    error: unknown;
}

export type ClientResponse<T = unknown> =
    | ClientSuccessResponse<T>
    | ClientErrorResponse;
