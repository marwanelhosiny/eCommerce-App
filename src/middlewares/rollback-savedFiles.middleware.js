

export const rollbackSavedFiles = async (req,res,next) => {
    if(req.savedDoc){
        console.log('Rolling back saved files')
        
        const {model , _id} = req.savedDoc
        await model.findByIdAndDelete(_id)
    }
}