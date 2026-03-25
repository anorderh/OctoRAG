export function formatRepoSize(kb: number): string {
    if (!kb) return '—';

    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(2)} MB`;

    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
}
