import { CustomTimeoutError } from "src/error-handling/errors";

export function withTimeout(promise: Promise<any>, ms: number) {
    let timeoutPid: NodeJS.Timeout;
    
    return Promise.race([
        promise,
        new Promise((resolve, reject) => {
            timeoutPid = setTimeout(
                () => reject(new CustomTimeoutError()),
                ms
            )
        }),
    ]).finally(() => {
        if (timeoutPid) {
            clearTimeout(timeoutPid);
        }
    });
}