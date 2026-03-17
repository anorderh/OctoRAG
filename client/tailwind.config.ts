export default {
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',

                card: 'var(--card)',
                border: 'var(--border)',

                muted: 'var(--muted)',
                primary: 'var(--primary)',
            },
            boxShadow: {
                card: '0 4px 12px var(--shadow)',
            },
        },
    },
    compilerOptions: {
        baseUrl: '.',
        paths: {
            '@/*': ['src/*'],
        },
    },
};
