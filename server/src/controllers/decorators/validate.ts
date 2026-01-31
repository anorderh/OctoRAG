import Joi, { PartialSchemaMap } from 'joi';
import { createJoiMiddleware } from 'src/shared/utils/joi-middleware.js';
import { Middleware } from '../shared/types/middleware.js';
import { RequestProp } from '../shared/types/request-prop.js';

export function Validate(prop: RequestProp, schema: PartialSchemaMap) {
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

        dict[methodId].push(createJoiMiddleware(prop, Joi.object(schema)));
    };
}
