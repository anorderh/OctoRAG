// Alternative to serverless workers.
export class Tasks {
    static run(task: () => Promise<void>): void {
        setImmediate(async () => {
            try {
                await task();
            } catch (err) {
                console.error('Background task failed', err);
            }
        });
    }
}
