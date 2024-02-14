


export const globalResponse=(err,req,res,next)=>{
    if(err){
         res.status(err['cause']||500).json({message:err.message})
    }
    next()
}