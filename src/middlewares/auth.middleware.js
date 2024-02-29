import jwt from "jsonwebtoken"
import User from "../../DB/models/user.model.js"
import { systemRoles } from "../utils/system-roles.js"

//==================================================authentication middlleware========================================//
export const auth=(accessRoles=[systemRoles.SUPERADMIN,systemRoles.ADMIN,systemRoles.USER,systemRoles.DELIEVER])=>{
    return async(req,res,next)=>{
        try{const{accesstoken}=req.headers
        console.log(accessRoles)
        if(!accesstoken){return next(new Error('missing access token',{cause:400}))}

        const prefix= accesstoken.startsWith(process.env.ACCESSTOKEN_PREFIX)
        if(!prefix){return next(new Error('invalid token',{cause:400}))}

        const token= accesstoken.slice(6)
        const verifiedToken= jwt.verify(token,process.env.ACCESSTOKEN_SECRET_KEY)
        if(!verifiedToken || !verifiedToken._id){return next(new Error('invalid token payload',{cause:400}))}
        
        //checking if user is deleted or role updated while using an old valid token
        const stillExist= await User.findById(verifiedToken._id,'username email role')
        if(!stillExist){return next(new Error('please signUp first',{cause:400}))}

        //authorization check
        if(!accessRoles?.includes(stillExist.role)){return next(new Error('you are not allowed to access this URL',{cause:400}))}
        req.authUser=stillExist
        next()
    }catch(error){next(new Error(`authentication error :${error.message}`,{casue:400}))}
    }
}