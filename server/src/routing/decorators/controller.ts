import { container } from "tsyringe";
import { RouteInput } from "../../utils/interfaces/route-input";
import { Router } from "express";
import { Middleware } from "../../utils/types/middleware";

export function Controller(prefix: string): ClassDecorator {
    return (target: any) => {
        Reflect.defineMetadata('prefix', prefix, target);
        let routesDict = Reflect.getMetadata('routes', target) as {[key: string]: RouteInput};

        if (!!routesDict && Object.keys(routesDict).length > 0) {
            let controller = container.resolve(target) as any;
            let router = controller.router as Router;
            let middlewareDict = Reflect.getMetadata('middleware', target) as {[key: string]: Middleware[]};

            Object.entries(routesDict).forEach(([method, input] : [string, RouteInput] ) => {
                let route = `${prefix}${input.path}`;
                let middleware = middlewareDict[method] ?? [];
                let impl = controller[method];

                router[input.httpType](
                    route,                  // Route
                    middleware,             // Middleware
                    impl.bind(controller)   // Method.
                )             
            })
        }
    }
}

