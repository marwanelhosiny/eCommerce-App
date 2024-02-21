import Joi from "joi";
import { objectidValidation } from "../../utils/idValidator.js";

export const addproductSchema ={
    body:Joi.object({
        title:Joi.string().min(2).max(20).required(),
        desc:Joi.string().min(2).max(200),
        basePrice:Joi.number().min(0).required(),
        discount:Joi.number().min(0),
        stock:Joi.number().min(0),
    }).unknown(true),
    query:Joi.object({
        categoryId:Joi.string().custom(objectidValidation),
        subCategoryId:Joi.string().custom(objectidValidation),
        brandId:Joi.string().custom(objectidValidation)
    })
}

export const updateproductSchema={
    body:Joi.object({
        title:Joi.string().min(2).max(20),
        desc:Joi.string().min(2).max(200),
        basePrice:Joi.number().min(0),
        discount:Joi.number().min(0),
        stock:Joi.number().min(0),
        oldPublicId:Joi.string()
    }).unknown(true),
    query:Joi.object({
        productId:Joi.string().custom(objectidValidation)
    })
}

export const deleteproductSchema={
    query:Joi.object({
        productId:Joi.string().custom(objectidValidation).required()
    })

}

export const getproductbyidSchema={
    query:Joi.object({
        productId:Joi.string().custom(objectidValidation).required()
    })

}

export const getproductsfor2brandSchema={
    query:Joi.object({
        firstBrandId:Joi.string().custom(objectidValidation).required(),
        secondBrandId:Joi.string().custom(objectidValidation).required()
    })
}

export const searchproductSchema={
    query:Joi.object({
        title:Joi.string().min(2).max(20),
        desc:Joi.string().min(2).max(200),
        priceFrom:Joi.number().min(0),
        priceTo:Joi.number().min(0),
        stock:Joi.number().min(0),
        colors:Joi.string().min(2).max(20),
        size:Joi.string().min(2).max(20)
    })
}