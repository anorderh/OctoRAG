
export function parseRegex(input: string, regex: RegExp): string | null {
    const match = input.match(regex);
    return match
        ? match[1]
        : null;
}