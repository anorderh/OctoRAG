import Joi, { ObjectSchema, PartialSchemaMap } from "joi";
import { Middleware } from "../../utils/types/middleware";
import { authorize } from "../middleware/authorize";
import { createJoiMiddleware } from "../../utils/extensions/joi-middleware";
import { RequestProp } from "../../utils/types/request-prop";

export function Validate(prop: RequestProp, schema: PartialSchemaMap) {
    return (target: any, propertyKey: string): void => {
        if (!Reflect.hasMetadata('middleware', target.constructor)) {
            Reflect.defineMetadata('middleware', {}, target.constructor);
        }

        let methodId = propertyKey;
        const dict = Reflect.getMetadata('middleware', target.constructor) as {[key: string]: Middleware[]};
        if (!dict[methodId]) {
            dict[methodId] = [];
        }

        dict[methodId].push(
            createJoiMiddleware(prop, Joi.object(schema))
        );
    }
}