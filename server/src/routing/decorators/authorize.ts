import { authorize } from '../middleware/authorize.js';
import { Middleware } from '../utils/types/middleware.js';

export function Authorize() {
    return (target: any, propertyKey: string): void => {
        if (!Reflect.hasMetadata('middleware', target.constructor)) {
            Reflect.defineMetadata('middleware', {}, target.constructor);
        }

        let methodId = propertyKey;
        const dict = Reflect.getMetadata('middleware', target.constructor) as {[key: string]: Middleware[]};
        if (!dict[methodId]) {
            dict[methodId] = [];
        }

        dict[methodId].push(authorize);
    }
}