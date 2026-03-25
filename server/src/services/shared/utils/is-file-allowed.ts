export const CODE_EXTENSIONS = new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.c',
    '.cc',
    '.cpp',
    '.h',
    '.hpp',
    '.cs',
    '.py',
    '.java',
    '.go',
    '.rs',
    '.sql',
    '.yaml',
    '.yml',
    '.sh',
    // '.md', // Parse out to avoid documentation
    '.dart',
]);

export const EXCLUDED_EXTENSIONS = new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.zip',
    '.tar',
    '.gz',
    '.exe',
    '.dll',
    '.so',
    '.lock',
    '.log',
    '.map',
    '.snap',
    '.cache',
    '.tmp',
    '.bak',
    '.min.js',
    '.min.css',
    '.yml',
]);

export const EXCLUDED_KEYWORDS = new Set([
    'node_modules',
    '.git',
    '.github',
    '.next',
    'dist',
    'build',
    'out',
    'coverage',
    'logs',
    'tmp',
    'temp',
    '.cache',
    '.turbo',
    '.vercel',
    '.idea',
    '.vscode',

    // Testing
    'test',
    'tests',
    '__tests__',
    'spec',
    '__snapshots__',

    // Build systems / native
    'cmake-build',
    'CMakeFiles',

    // Tooling
    '.husky',
    '.changeset',

    // Static / non-source
    'public',
    'static',
    'assets',
    'uploads',
    'apps',

    // Low-signal directories
    'examples',
    'benchmarks',

    // Sample code
    'tutorial',
    'example',

    // // Monorepos (optional — see note below)
    // 'packages',
]);

export const IGNORED_FILENAMES = new Set([
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'CMakeCache.txt',
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
]);

export const GENERATED_FILE_PATTERNS = [
    '.min.',
    '.bundle.',
    '.generated.',
    '.auto.',
    '.g.',
    '.d.ts',
];

import path from 'path';

export function shouldIncludeFile(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();
    const segments = normalizedPath.split('/').filter(Boolean);
    const fileName = segments[segments.length - 1] || '';

    for (const segment of segments) {
        if (EXCLUDED_KEYWORDS.has(segment)) {
            return false;
        }
    }
    if (IGNORED_FILENAMES.has(fileName)) {
        return false;
    }

    const extension = path.extname(fileName);
    if (!extension) return false;

    if (EXCLUDED_EXTENSIONS.has(extension)) {
        return false;
    }
    if (!CODE_EXTENSIONS.has(extension)) {
        return false;
    }
    if (GENERATED_FILE_PATTERNS.some((p) => fileName.includes(p))) {
        return false;
    }
    const SOFT_EXCLUDED_WORDS = ['example', 'tutorial', 'demo'];
    const pathWords = normalizedPath.split(/[\W_]+/); // splits on / . - _ etc
    if (
        pathWords.some((word) =>
            SOFT_EXCLUDED_WORDS.some((keyword) => word.includes(keyword)),
        )
    ) {
        return false;
    }

    return true;
}
