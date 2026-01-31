import { Middleware } from '../shared/types/middleware';

export function Middleware(handler: Middleware) {
    return (target: any, propertyKey: string): void => {
        if (!Reflect.hasMetadata('middleware', target.constructor)) {
            Reflect.defineMetadata('middleware', {}, target.constructor);
        }

        let methodId = propertyKey;
        const dict = Reflect.getMetadata('middleware', target.constructor) as {
            [key: string]: Middleware[];
        };
        if (!dict[methodId]) {
            dict[methodId] = [];
        }

        dict[methodId].push(handler);
    };
}
