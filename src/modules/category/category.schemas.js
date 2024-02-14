import Joi from "joi"
import { objectidValidation } from "../../utils/idValidator.js"


export const addcategorySchema={
    body:Joi.object({
        name:Joi.string().min(2).max(20).required(),
    })
}
export const updatecategorySchema={
    body:Joi.object({
        name:Joi.string().min(2).max(20),
        oldPublicId:Joi.string()
    }),
    params:Joi.object({
        categoryId:Joi.string().custom(objectidValidation)
    })
}

export const deletecategorySchema={
    params:Joi.object({
        categoryId:Joi.string().custom(objectidValidation)
    })
}