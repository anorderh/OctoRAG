export abstract class AsyncService {
    abstract initialize(): Promise<any>
}