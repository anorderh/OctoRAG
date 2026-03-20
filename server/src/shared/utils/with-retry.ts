export async function withRetry<T>(
    fn: () => Promise<T>,
    {
        retries = 5,
        baseDelay = 1000,
        maxDelay = 60000,
    }: {
        retries?: number;
        baseDelay?: number;
        maxDelay?: number;
    } = {},
): Promise<T> {
    let attempt = 0;

    while (true) {
        try {
            return await fn();
        } catch (err: any) {
            const isRateLimit =
                err?.status === 429 || err?.code === 'rate_limit_exceeded';

            if (!isRateLimit || attempt >= retries) {
                throw err;
            }

            if (attempt === 2) {
                console.warn('Cooling down for 60s...');
                await new Promise((res) => setTimeout(res, 60000));
            }

            // Exponential backoff + jitter
            const delay = Math.min(
                baseDelay * 2 ** attempt + Math.random() * 500,
                maxDelay,
            );

            console.warn(`Rate limited. Retry ${attempt + 1} in ${delay}ms`);

            await new Promise((res) => setTimeout(res, delay));

            attempt++;
        }
    }
}
