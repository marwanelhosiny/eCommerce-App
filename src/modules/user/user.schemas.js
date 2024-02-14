import Joi from "joi"





export const updateuserprofileSchema={
    body:Joi.object({
        username:Joi.string().min(3).max(15),
        email:Joi.string().email(),
        addresses:Joi.array().items(Joi.string()),
        phoneNumbers:Joi.array().items(Joi.string()),
    })
}