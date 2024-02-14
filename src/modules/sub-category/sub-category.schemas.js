import Joi from "joi"
import { objectidValidation } from "../../utils/idValidator.js"


export const addsubcategorySchema={
    body:Joi.object({
        name:Joi.string().min(2).max(20).required(),
    }),
    params:Joi.object({
        categoryId:Joi.string().custom(objectidValidation)
    })
}
export const updatesubcategorySchema={
    body:Joi.object({
        name:Joi.string().min(2).max(20),
        oldPublicId:Joi.string()
    }),
    params:Joi.object({
        subCategoryId:Joi.string().custom(objectidValidation)
    })
}

export const deletesubcategorySchema={
    params:Joi.object({
        subCategoryId:Joi.string().custom(objectidValidation)
    })
}