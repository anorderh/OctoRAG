// Hack to handle different spawn location between VSCode Debug profiles & npm scripts.
let env = process.env.APP_ENV!;
let pathPrefix = Boolean(process.env.VSCODE_DEBUG) ? './server' : '.';

export const pathes = Object.entries({
    config: `/config/.env.${env}`,
    logs: '/logs',
    temp: '/temp',
    seedData: '/seeding/data',
    prompts: '/src/shared/constants/prompts',
}).reduce((acc: any, [prop, path]: [string, string]) => {
    acc[prop] = `${pathPrefix}${path}`;
    return acc;
}, {});
