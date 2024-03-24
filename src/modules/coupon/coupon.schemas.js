import Joi from 'joi';
import { objectidValidation } from '../../utils/idValidator.js';


export const addcoupnSchema = {
    body: Joi.object({
        couponCode: Joi.string().required(),
        discountAmount : Joi.number().min(1).required(),
        fromDate : Joi.date().greater(Date.now()-24*60*60*1000).required(),
        toDate : Joi.date().greater(Joi.ref('fromDate   ')).required(),
        isPercentage : Joi.boolean(),
        isFixed : Joi.boolean(),
        addedBy : Joi.string().custom(objectidValidation),
        users : Joi.array().items(Joi.object({
            userId:Joi.string().custom(objectidValidation).required(),
            maxUsage : Joi.number().min(1).required(),
        })
        )
    })
}


export const disablecoupnSchema = {
    params: Joi.object({
        couponId: Joi.string().custom(objectidValidation).required()
    })
}

export const enablecoupnSchema = {
    params: Joi.object({
        couponId: Joi.string().custom(objectidValidation).required()
    })
}

export const getCouponByIdSchema = {
    params: Joi.object({
        couponId: Joi.string().custom(objectidValidation).required()
    })
}

export const updatecouponSchema = {
    body: Joi.object({
        discountAmount : Joi.number(),
        fromDate: Joi.date().greater(Date.now() - 24 * 60 * 60 * 1000).required(),
        toDate: Joi.date().greater(Joi.ref('fromDate   ')).required()
    }),
    params: Joi.object({
        couponId: Joi.string().custom(objectidValidation).required()
    })
}