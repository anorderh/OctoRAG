import Joi from "joi";
import { ObjectId } from "mongodb";

export const objectId = Joi.string().custom((val, helpers) => {
    if (!ObjectId.isValid(val)) {
        return helpers.error('any.invalid');
    }
    return val;
})