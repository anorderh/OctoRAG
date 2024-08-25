
export type MongoCheck<T> = (input: T) => void;

export function executeMongoChecks<T>(checks: MongoCheck<T>[]) {
    return (input: T | null) => {
        for(let c of checks) {
            c(input);
        }
        return input;
    }
}