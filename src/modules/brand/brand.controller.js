import slugify from "slugify";
import Brand from "../../../DB/models/brand.model.js";
import Category from "../../../DB/models/category.model.js";
import SubCategory from "../../../DB/models/sub-category.model.js";
import generateUniequeString from "../../utils/generateUniqueString.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import Product from "../../../DB/models/product.model.js";
import { systemRoles } from "../../utils/system-roles.js";




//================================================ add brand =============================//
export const addBrand = async(req,res,next) =>{

    //1- destructing the required data from request
    const { _id } = req.authUser
    const {name} = req.body
    const {categoryId,subCategoryId}= req.query

    //2- checking if the category exists
    const category = await Category.findById(categoryId)
    if(!category){return next(new Error('category does not exist',{cause:400}))}

    //3- checking if the subCategory exists
    const subCategory = await SubCategory.findById(subCategoryId)
    if(!subCategory){return next(new Error('subCategory does not exist',{cause:400}))}

    //4- checking if the name is already taken
    const isExist = await Brand.findOne({name,subCategoryId})
    if(isExist){return next(new Error('brand already exist',{cause:400}))}

    //5- generating the slug for the brand
    const slug = slugify(name,{lower:true,replacement:"-"})

    //6- checking if the image is provided
    if(!req.file){return next(new Error('you must provide a file',{cause:400}))}

    //6-1 uploading the image to cloudinary
    const folderId = generateUniequeString(4)
    const {public_id,secure_url} = await cloudinaryConnection().uploader.upload(req.file.path,
        {
            folder: `${subCategory.image.public_id}/brands/${folderId}`,
            resource_type: 'image'
        })
    req.folder = `eCommerce/categories/${category.image.folderId}/${folderId}`


    //7- creating the brand
    const brand = {
        name,
        slug,
        categoryId,
        subCategoryId,
        addedBy: _id,
        image :{public_id,secure_url,folderId}
    }

    const brandCreated = await Brand.create(brand)
    if(!brandCreated){return next(new Error('something went wrong',{cause:400}))}
    req.savedDoc = {model: Brand , _id: brandCreated._id}

    res.status(200).json({message:'brand added successfully',brandCreated})
}


//========================================== update brand =================================//
export const updateBrand = async(req,res,next)=>{
    //1- destructing the required data from request
    const { _id } = req.authUser
    const {name , oldPublicId} = req.body
    const {brandId}= req.params

    //2- checking if brand exists
    const brand = await Brand.findById(brandId)
    if(!brand){return next(new Error('brand does not exist',{cause:400}))}

    //3- checking authorty
    if(brand.addedBy.toString()!= _id.toString()){return next(new Error('you are not authorized to update this brand',{cause:400}))}

    //4- checking if the name sent and not the same old name and not already taken
    if(name  ){
        if(name== brand.name){return next(new Error('name is typlcaly same as the old name',{cause:400}))}
        const isExist = await Brand.findOne({name})
    if(isExist){return next(new Error('brand already exist',{cause:400}))}}

    //4-1-update the brand name and slug
    brand.name = name
    brand.slug = slugify(name,{lower:true,replacement:"-"})

    //5- checking if user wants to update image
    if(oldPublicId ){
        if(!req.file){return next(new Error('image is required',{cause:400}))}

        //5-1 override the image on cloudinary
        const {secure_url} = await cloudinaryConnection().uploader.upload(req.file.path,{
            resource_type: 'image',
            public_id: oldPublicId
        })
        brand.image.secure_url = secure_url
    }

    //6- updating the category
    brand.updatedBy = _id
    const updatedBrand = await brand.save()
    if(!updatedBrand){return next(new Error('something went wrong',{cause:400}))}

    res.status(200).json({message:'category updated successfully',updatedBrand})
}


//================================================ delete brand ================================//

export const deleteBrand = async(req,res,next)=>{
    //1- destructing the required data from request
    const {brandId}= req.params
    const { _id } = req.authUser

    //2- checking if brand exists
    const brand = await Brand.findById(brandId)
    if(!brand){return next(new Error('brand does not exist',{cause:400}))}

    //2- checking authorty
     if(req.authUser.role!==systemRoles.SUPERADMIN && brand.addedBy.toString()!= _id.toString()){return next(new Error('you are not authorized to delete this brand',{cause:400}))}

    //3- deleting the brand
    const deletedBrand = await Brand.findByIdAndDelete(brandId)
    if(!deletedBrand){return next(new Error('brand not found',{cause:400}))}

    //4- deleting brand folder from cloudinary
    const lastSlashIndex = deletedBrand.image.public_id.lastIndexOf('/')
    const folder = deletedBrand.image.public_id.slice(0, lastSlashIndex)
    await cloudinaryConnection().api.delete_resources_by_prefix(folder)
    await cloudinaryConnection().api.delete_folder(folder)

    //5- deleting related products
    const deletedProducts = await Product.deleteMany({brandId})
    console.log('no related products')

    res.status(200).json({message:'brand deleted successfully',deleteBrand})

}
