export function getFileUrl(
    owner: string,
    repo: string,
    defaultBranch: string,
    filepath: string,
): string {
    const parts = filepath.replace(/^\/+/, '').split('/');

    const cleanPath =
        parts.length > 1 && (parts[0].includes('-') || parts[0].includes('.'))
            ? parts.slice(1).join('/')
            : parts.join('/');

    return `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${cleanPath}`;
}
