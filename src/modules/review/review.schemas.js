import Joi  from "joi";
import { objectidValidation } from "../../utils/idValidator.js";



export const addreviewSchema = {
    body: Joi.object({
        rate: Joi.number().min(1).max(5).required(),
        comment: Joi.string().min(2).max(255)
    }),
    params: Joi.object({
        productId: Joi.string().custom(objectidValidation)
    })
}

export const deletereviewSchema = {
    params: Joi.object({
        reviewId: Joi.string().custom(objectidValidation),
        productId: Joi.string().custom(objectidValidation)
    })
}

export const getreviewsSchema = {
    params: Joi.object({
        productId: Joi.string().custom(objectidValidation)
    })
}