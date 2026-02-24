export interface ClientResponse<T = null> {
    success: true;
    message: string;
    data: T;
}
