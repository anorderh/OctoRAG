export const MAX_CHARS = 120_000;
export function truncateForTokenSafety(input: string): string {
    if (input.length <= MAX_CHARS) return input;
    const head = input.slice(0, MAX_CHARS * 0.7);
    const tail = input.slice(-MAX_CHARS * 0.3);
    return `${head}\n\n/* TRUNCATED */\n\n${tail}`;
}
