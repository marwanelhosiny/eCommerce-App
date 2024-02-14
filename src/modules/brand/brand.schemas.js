import Joi from "joi"
import { objectidValidation } from "../../utils/idValidator.js"


export const addbrandSchema= {
    body:Joi.object({
        name:Joi.string().min(2).max(20).required(),
    }),
    query:Joi.object({
        categoryId:Joi.string().custom(objectidValidation),
        subCategoryId:Joi.string().custom(objectidValidation)
    })
}

export const updatebrandSchema={
    body:Joi.object({
        name:Joi.string().min(2).max(20),
        oldPublicId:Joi.string()
    }),
    params:Joi.object({
        brandId:Joi.string().custom(objectidValidation)
    })
}

export const deletebrandSchema={
    params:Joi.object({
        brandId:Joi.string().custom(objectidValidation)
    })
}