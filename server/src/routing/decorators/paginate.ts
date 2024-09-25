import { Middleware } from '../../utils/types/middleware';
import { authorize } from '../middleware/authorize';
import { paginate } from '../middleware/paginate';

export function Paginate() {
    return (target: any, propertyKey: string): void => {
        if (!Reflect.hasMetadata('middleware', target.constructor)) {
            Reflect.defineMetadata('middleware', {}, target.constructor);
        }

        let methodId = propertyKey;
        const dict = Reflect.getMetadata('middleware', target.constructor) as {[key: string]: Middleware[]};
        if (!dict[methodId]) {
            dict[methodId] = [];
        }

        dict[methodId].push(paginate);
    }
}