import multer from "multer";
import { nanoid } from "nanoid";
import { allowedExtensions } from "../utils/allowedExtensions.js";
import fs, { mkdirSync } from "fs"
import path from "path"
import generateUniequeString from "../utils/generateUniqueString.js";


export const multermiddleLocal=(
    extensions=allowedExtensions.Image,
    filepath='general')=>{
    const destinationPath=path.resolve(`uploads/${filepath}`)
    if(!fs.existsSync(destinationPath)){
        mkdirSync(destinationPath,{recursive:true})
    }

    const storage=multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,destinationPath)
        },
        filename:(req,file,cb)=>{
            const uniqueFileName=nanoid(5)+'_'+file.originalname
            cb(null,uniqueFileName)
        }
    })
    const fileFilter = (req,file,cb)=>{
        if(extensions.includes(file.mimetype.split('/')[1])){
            return cb(null,true)
        }
        cb(Error('wrong format'),false)
    }
    const file = multer({fileFilter,storage})
    return file
}

export const multermiddleware=(
    extensions=allowedExtensions.Image)=>{
    const storage=multer.diskStorage({
        filename:(req,file,cb)=>{
            const uniqueFileName= generateUniequeString(6)+'_'+file.originalname
            cb(null,uniqueFileName)
        }
    })
    const fileFilter = (req,file,cb)=>{
        if(extensions.includes(file.mimetype.split('/')[1])){
            return cb(null,true)
        }
        cb(Error('wrong format'),false)
    }
    const file = multer({fileFilter,storage})
    return file
}