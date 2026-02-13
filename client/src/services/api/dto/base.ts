export interface ClientResponse<T = unknown> {
    success: true;
    message: string;
    data: T | null;
}
