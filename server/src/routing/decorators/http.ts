import { HttpVerb } from '../../utils/enums/http-verbs.js';
import { RouteInput } from '../../utils/interfaces/route-input.js';

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
            httpType: HttpVerb.GET,
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
            httpType: HttpVerb.POST,
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
            httpType: HttpVerb.PATCH,
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
            httpType: HttpVerb.DELETE,
            path
        } as RouteInput;
    }
}