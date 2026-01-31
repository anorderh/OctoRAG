import { RouteInput } from '../shared/interfaces/route-input.js';
import { Middleware } from '../shared/types/middleware.js';

/*
    Apply middleware onto a controller's routes.
*/
export function Blanket(input: Middleware | Middleware[]): ClassDecorator {
    return (target: any) => {
        if (!Reflect.hasMetadata('middleware', target.constructor)) {
            Reflect.defineMetadata('middleware', {}, target.constructor);
        }

        let middlewareDict = Reflect.getMetadata('middleware', target) as {
            [key: string]: Middleware[];
        };
        let routesDict = Reflect.getMetadata('routes', target) as {
            [key: string]: RouteInput;
        };
        Object.keys(routesDict).forEach((id) => {
            let currMiddleware = middlewareDict[id];

            if (currMiddleware == null) {
                middlewareDict[id] = [];
            }

            if (input instanceof Array) {
                middlewareDict[id].concat(input);
            } else {
                middlewareDict[id].push(input);
            }
        });
    };
}
