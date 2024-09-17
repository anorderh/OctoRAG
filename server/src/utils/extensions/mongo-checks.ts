
export type MongoCheck<T> = (input: T) => void;

export function executeMongoChecks<T>(checks: MongoCheck<T> | MongoCheck<T>[]) {
    return (input: T | null) => {
        if (checks instanceof Array) {
            for(let c of checks) {
                c(input);
            }
        } else {
            checks(input);
        }
        return input;
    }
}