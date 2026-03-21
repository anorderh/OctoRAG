type KeywordOptions = {
    maxKeywords?: number;
    filepath?: string;
};

const STOPWORDS = new Set([
    'const',
    'let',
    'var',
    'function',
    'return',
    'if',
    'else',
    'true',
    'false',
    'null',
    'undefined',
    'import',
    'from',
    'export',
    'default',
    'class',
    'new',
    'await',
    'async',
]);

function splitIdentifier(token: string): string[] {
    return token
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_\-]/g, ' ')
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
}

function extractIdentifiers(code: string): string[] {
    const matches = code.match(/[A-Za-z_][A-Za-z0-9_]*/g);
    return matches ?? [];
}

export function extractKeywordsFromCode(
    code: string,
    options: KeywordOptions = {},
): string[] {
    const { maxKeywords = 25, filepath } = options;

    const rawTokens = extractIdentifiers(code);

    const expanded = rawTokens.flatMap((token) => {
        const parts = splitIdentifier(token);
        return parts.length > 1
            ? [token.toLowerCase(), ...parts]
            : [token.toLowerCase()];
    });

    const filtered = expanded.filter((t) => t.length > 2 && !STOPWORDS.has(t));

    const freq = new Map<string, number>();

    for (const token of filtered) {
        freq.set(token, (freq.get(token) || 0) + 1);
    }

    if (filepath) {
        const pathTokens = filepath
            .toLowerCase()
            .split(/[\/\.]/)
            .filter((t) => t.length > 2);

        for (const token of pathTokens) {
            freq.set(token, (freq.get(token) || 0) + 4);
        }
    }

    const scored = Array.from(freq.entries()).map(([token, count]) => {
        let score = count;

        if (token.startsWith('use')) score *= 1.4;
        if (token.includes('store')) score *= 1.6;
        if (token.includes('service')) score *= 1.3;
        if (token.includes('controller')) score *= 1.3;
        if (token.length > 10) score *= 1.2;

        return { token, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, maxKeywords).map((s) => s.token);
}
