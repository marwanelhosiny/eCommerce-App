import cloudinaryConnection from "../utils/cloudinary.js"


export const rollBackUploadedFiles = async (req,res,next)=>{
    if(req.folder){
        console.log('Rolling back uploaded files')

        const emptyFolder =await cloudinaryConnection().api.delete_resources_by_prefix(req.folder)
        const deleteFolder =await cloudinaryConnection().api.delete_folder(req.folder)
    }

    next()
}