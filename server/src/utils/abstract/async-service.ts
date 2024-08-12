
export abstract class AsyncService {
    abstract initialize(): Promise<void> 
    abstract cleanup(): Promise<void>
}