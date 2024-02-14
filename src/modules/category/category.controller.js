import Category from "../../../DB/models/category.model.js";
import slugify from "slugify";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniequeString from "../../utils/generateUniqueString.js";
import Brand from "../../../DB/models/brand.model.js";
import Product from "../../../DB/models/product.model.js";
import SubCategory from "../../../DB/models/sub-category.model.js";




//========================================== add category =================================//
export const addCategory = async (req,res,next) =>{
    //1- destructing the required data from request
    const { _id } = req.authUser
    const {name} = req.body

    //2- checking if the name is already taken
    const isExist = await Category.findOne({name})
    if(isExist){return next(new Error('category already exist',{cause:400}))}

    //3-generating the slug for the category
    const slug = slugify(name,{lower:true,replacement:"-"})

    //4- checking if the image is provided
    if(!req.file){return next(new Error('you must provide a file',{cause:400}))}

    //5- uploading the image to cloudinary
    const folderId = generateUniequeString(4)
    const {public_id,secure_url} = await cloudinaryConnection().uploader.upload(req.file.path,
        {
            folder: `eCommerce/categories/${folderId}`,
            resource_type: 'image'
        })
        req.folder = `eCommerce/categories/${folderId}`
    
    
    //6- creating the category
    const category = {name, slug, image :{public_id,secure_url,folderId},addedBy: _id}
    const categoryCreated = await Category.create(category)
    if(!categoryCreated){return next(new Error('something went wrong',{cause:400}))}
    req.savedDoc = {model: Category , _id: categoryCreated._id}
    res.status(200).json({message:'category added successfully',categoryCreated})
}


//========================================== update category =================================//
export const updateCategory = async(req,res,next)=>{
    //1- destructing the required data from request
    const { _id } = req.authUser
    const {name , oldPublicId} = req.body
    const {categoryId}= req.params

    //2- checking if category exists
    const category = await Category.findById(categoryId)
    if(!category){return next(new Error('category does not exist',{cause:400}))}

    //3- checking if the name sent and not the same old name and not already taken
    if(name  ){
        if(name== category.name){return next(new Error('name is typlcaly same as the old name',{cause:400}))}
        const isExist = await Category.findOne({name})
    if(isExist){return next(new Error('category already exist',{cause:400}))}}
        
    //4-update the category name and slug
    category.name = name
    category.slug = slugify(name,{lower:true,replacement:"-"})

    //5- checking if user wants to update image
    if(oldPublicId ){
        if(!req.file){return next(new Error('image is required',{cause:400}))}

        //5-1 override the image on cloudinary
        const {secure_url} = await cloudinaryConnection().uploader.upload(req.file.path,{
            resource_type: 'image',
            public_id: oldPublicId
        })
        category.image.secure_url = secure_url
    }

    //6- updating the category
    category.updatedBy = _id
    const updatedCategory = await category.save()
    if(!updatedCategory){return next(new Error('something went wrong',{cause:400}))}

    res.status(200).json({message:'category updated successfully',updatedCategory})
}


//========================================== get all categories =================================//

export const getAllCategories = async(req,res,next)=>{

    //1- getting all categories with their sub-categories
    const categories = await Category.find().populate([{
        path:'subcategories',
        populate: [{
            path: 'brands',
            populate: [{
                path: 'products'
            }]
        }]
    }])
    if(!categories){return next(new Error('something went wrong',{cause:400}))}

    res.status(200).json({message:'categories fetched successfully',categories})
}

//========================================== delete category =================================//

export const deleteCategory = async(req,res,next)=>{
    //1- destructing the required data from request
    const {categoryId}= req.params

    //2- deleting the Category
    const deletedCategory = await Category.findByIdAndDelete(categoryId)
    if(!deletedCategory){return next(new Error('category not found',{cause:400}))}

    //3- deleting Category folder from cloudinary
    const lastSlashIndex = deletedCategory.image.public_id.lastIndexOf('/')
    const folder = deletedCategory.image.public_id.slice(0, lastSlashIndex)
    await cloudinaryConnection().api.delete_resources_by_prefix(folder)
    await cloudinaryConnection().api.delete_folder(folder)

    //4- deleting related sub-categories
    const deletedSubCategories = await SubCategory.deleteMany({categoryId})
    console.log('no related subCategories')

    //5- deleting related brands
    const deletedBrands = await Brand.deleteMany({categoryId})
    console.log('no related brands')

    //6- deleting related products
    const deletedProducts = await Product.deleteMany({categoryId})
    console.log('no related products')

    res.status(200).json({message:'Category deleted successfully',deletedCategory})

}

