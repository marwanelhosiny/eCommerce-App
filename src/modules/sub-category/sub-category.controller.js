import SubCategory from "../../../DB/models/sub-category.model.js";
import slugify from "slugify";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniequeString from "../../utils/generateUniqueString.js";
import Category from "../../../DB/models/category.model.js";
import Brand from "../../../DB/models/brand.model.js";
import Product from "../../../DB/models/product.model.js";




//========================================== add SubCategory =================================//
export const addSubCategory = async (req,res,next) =>{
    //1- destructing the required data from request
    const { _id } = req.authUser
    const {name} = req.body
    const {categoryId}= req.params

    //2- checking if the name is already taken
    const isExist = await SubCategory.findOne({name})
    if(isExist){return next(new Error('subCategory already exist',{cause:400}))}

    //3- checking if category exists
    const category = await Category.findById(categoryId)
    if(!category){return next(new Error('category does not exist',{cause:400}))}

    //4-generating the slug for the subCategory
    const slug = slugify(name,{lower:true,replacement:"-"})

    //5- checking if the image is provided
    if(!req.file){return next(new Error('you must provide a file',{cause:400}))}

    //6- uploading the image to cloudinary
    const folderId = generateUniequeString(4)
    const {public_id,secure_url} = await cloudinaryConnection().uploader.upload(req.file.path,
        {
            folder: `eCommerce/categories/${category.image.folderId}/${folderId}`,
            resource_type: 'image'
        })
    req.folder = `eCommerce/categories/${category.image.folderId}/subCategories/${folderId}`
    //7- creating the subCategory
    const subCategory = {categoryId,name, slug, image :{public_id,secure_url,folderId},addedBy: _id}
    const subCategoryCreated = await SubCategory.create(subCategory)
    if(!subCategoryCreated){return next(new Error('something went wrong',{cause:400}))}
    req.savedDoc = {model: SubCategory , _id: subCategoryCreated._id}

    res.status(200).json({message:'subCategory added successfully',subCategoryCreated})
}


//========================================== update subCategory =================================//
export const updateSubCategory = async(req,res,next)=>{
    //1- destructing the required data from request
    const { _id } = req.authUser
    const {name , oldPublicId} = req.body
    const {subCategoryId}= req.params

    //2- checking if subCategory exists
    const subCategory = await SubCategory.findById(subCategoryId)
    if(!subCategory){return next(new Error('category does not exist',{cause:400}))}

    //3- checking if the name sent and not the same old name and not already taken
    if(name  ){
        if(name== subCategory.name){return next(new Error('name is typlcaly same as the old name',{cause:400}))}
        const isExist = await Category.findOne({name})
    if(isExist){return next(new Error('subCategory already exist',{cause:400}))}}

    //4-update the subCategory name and slug
    subCategory.name = name
    subCategory.slug = slugify(name,{lower:true,replacement:"-"})

    //5- checking if user wants to update image
    if(oldPublicId ){
        if(!req.file){return next(new Error('image is required',{cause:400}))}

        //5-1 override the image on cloudinary
        const {secure_url} = await cloudinaryConnection().uploader.upload(req.file.path,{
            resource_type: 'image',
            public_id: oldPublicId
        })
        subCategory.image.secure_url = secure_url
    }

    //6- updating the category
    subCategory.updatedBy = _id
    const updatedsubCategory = await subCategory.save()
    if(!updatedsubCategory){return next(new Error('something went wrong',{cause:400}))}

    res.status(200).json({message:'subCategory updated successfully',updatedsubCategory})
}


//========================================== delete subCategory =================================//

export const deleteSubCategory = async(req,res,next)=>{
    //1- destructing the required data from request
    const {subCategoryId}= req.params

    //2- deleting the subCategory
    const deletedSubCategory = await SubCategory.findByIdAndDelete(subCategoryId)
    if(!deletedSubCategory){return next(new Error('something went wrong',{cause:400}))}

    //3- deleting subCategory folder from cloudinary
    const lastSlashIndex = deletedSubCategory.image.public_id.lastIndexOf('/')
    const folder = deletedSubCategory.image.public_id.slice(0, lastSlashIndex)
    await cloudinaryConnection().api.delete_resources_by_prefix(folder)
    await cloudinaryConnection().api.delete_folder(folder)

    //4- deleting related brands
    const deletedBrands = await Brand.deleteMany({subCategoryId})
    console.log('no related brands')

    //5- deleting related products
    const deletedProducts = await Product.deleteMany({subCategoryId})
    console.log('no related products')

    res.status(200).json({message:'subCategory deleted successfully',deletedSubCategory})

}


//========================================== get all subCategories =================================//
export const getAllsubCategories = async(req,res,next)=>{

    //1- getting all subCategories with their brands
    const subCategories = await SubCategory.find().populate([{
        path:'brands'
    }])
    if(!subCategories){return next(new Error('something went wrong',{cause:400}))}

    res.status(200).json({message:'subCategories fetched successfully',categories})
}