import { Types } from "mongoose"


export const objectidValidation=(value,helper)=>{
    const isValid= Types.ObjectId.isValid(value)
    return( isValid? value : helper.message('invalid objectId'))
}