import Joi from "joi";
import { createJoiMiddleware } from "../../utils/extensions/joi-middleware";

export const middleware = {
    register: createJoiMiddleware(
        Joi.object({
            username: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        })
    )
}