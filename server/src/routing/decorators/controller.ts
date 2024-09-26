import { container } from "tsyringe";
import { RouteInput } from '../../utils/interfaces/route-input.js';
import { NextFunction, Request, Response, Router } from "express";
import { Middleware } from '../../utils/types/middleware.js';
import { wrapExpressPromise } from '../../utils/extensions/wrap-express-promise.js';
import { Route } from '../../utils/types/route.js';

export function Controller(prefix: string): ClassDecorator {
    return (target: any) => {
        Reflect.defineMetadata('prefix', prefix, target);
        let routesDict = Reflect.getMetadata('routes', target) as {[key: string]: RouteInput};

        if (!!routesDict && Object.keys(routesDict).length > 0) {
            let controller = container.resolve(target) as any;
            let router = controller.router as Router;
            let middlewareDict = Reflect.getMetadata('middleware', target) as {[key: string]: Middleware[]};

            Object.entries(routesDict).forEach(([method, input] : [string, RouteInput] ) => {
                let route : string = `${prefix}${input.path}`;
                let middleware : Middleware[] = middlewareDict[method] ?? [];
                let impl : Route = controller[method];

                router[input.httpType](
                    route,                      // Route
                    middleware,                 // Middleware
                    wrapExpressPromise(         // To invoke error handler.
                        impl.bind(controller)   // Method.
                    )
                )             
            })
        }
    }
}

