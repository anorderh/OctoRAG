import { HttpVerb } from "../../utils/enums/http-verbs";
import { RouteInput } from "../../utils/interfaces/route-input";

export function Get(path: string) {
    return (target: any, propertyKey: string): void => {
        if (!Reflect.hasMetadata('routes', target.constructor)) {
            Reflect.defineMetadata('routes', {}, target.constructor);
        }
        
        let methodId= propertyKey;
        const dict = Reflect.getMetadata('routes', target.constructor) as {[key: string]: RouteInput};
        if (dict[methodId]) {
            throw new Error(`Decorator method \"${methodId}\" is already mapped to a route`)
        }
        dict[methodId] = {
            method: HttpVerb.GET,
            path
        } as RouteInput;
    }
}

export function Post(path: string) {
    return (target: any, propertyKey: string): void => {
        if (!Reflect.hasMetadata('routes', target.constructor)) {
            Reflect.defineMetadata('routes', {}, target.constructor);
        }
        
        let methodId= propertyKey;
        const dict = Reflect.getMetadata('routes', target.constructor) as {[key: string]: RouteInput};
        if (dict[methodId]) {
            throw new Error(`Decorator method \"${methodId}\" is already mapped to a route`)
        }
        dict[methodId] = {
            method: HttpVerb.POST,
            path
        } as RouteInput;
    }
}

export function Patch(path: string) {
    return (target: any, propertyKey: string): void => {
        if (!Reflect.hasMetadata('routes', target.constructor)) {
            Reflect.defineMetadata('routes', {}, target.constructor);
        }
        
        let methodId= propertyKey;
        const dict = Reflect.getMetadata('routes', target.constructor) as {[key: string]: RouteInput};
        if (dict[methodId]) {
            throw new Error(`Decorator method \"${methodId}\" is already mapped to a route`)
        }
        dict[methodId] = {
            method: HttpVerb.PATCH,
            path
        } as RouteInput;
    }
}

export function Delete(path: string) {
    return (target: any, propertyKey: string): void => {
        if (!Reflect.hasMetadata('routes', target.constructor)) {
            Reflect.defineMetadata('routes', {}, target.constructor);
        }
        
        let methodId= propertyKey;
        const dict = Reflect.getMetadata('routes', target.constructor) as {[key: string]: RouteInput};
        if (dict[methodId]) {
            throw new Error(`Decorator method \"${methodId}\" is already mapped to a route`)
        }
        dict[methodId] = {
            method: HttpVerb.DELETE,
            path
        } as RouteInput;
    }
}