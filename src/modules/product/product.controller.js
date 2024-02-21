import Product from "../../../DB/models/product.model.js";
import Brand from "../../../DB/models/brand.model.js";
import generateUniequeString from "../../utils/generateUniqueString.js";
import slugify from "slugify";
import cloudinaryConnection from "../../utils/cloudinary.js";
import { systemRoles } from "../../utils/system-roles.js";
import { pagination } from "../../utils/pagination.js";
import { ApiFeatures } from "../../utils/api-features.js";



//================================================ add product =============================//

export const addProduct = async (req, res, next) => {
    //1- destructing the required data from request
    const { title , desc , basePrice , discount , stock , specs } = req.body
    const { categoryId , subCategoryId , brandId } = req.query
    const { _id } = req.authUser

    //2- checking if the brand exists
    const brand = await Brand.findById(brandId)
    if(!brand){return next(new Error('brand does not exist',{cause:400}))}

    //3- checking if the sub-category exists
    if (subCategoryId != brand.subCategoryId){return next(new Error('sub-category does not exist'),{cause:400})}

    //4- checking if the category exists
    if(categoryId != brand.categoryId){return next(new Error('category does not exist',{cause:400}))}

    //5- checking authorty
    if(req.authUser.role!==systemRoles.SUPERADMIN && brand.addedBy.toString() !== _id.toString()){return next(new Error('you are not authorized to add this product',{cause:400}))}

    //6- generating slug
    const slug = slugify(title,{lower:true,replacement:'-'})

    //7- checking if the image is provided
    if(!req.files?.length){return next(new Error('you must provide a picture',{cause:400}))}

    //8- uploading the images to cloudinary
    const folderId = generateUniequeString(4)
    const lastSlashIndex = brand.image.public_id.lastIndexOf('/') 
    const destination = brand.image.public_id.slice(0,lastSlashIndex)

    let images = []
    for (const file of req.files) {
        const{secure_url , public_id} = await cloudinaryConnection().uploader.upload(file.path,{
            folder: `${destination}/products/${folderId}`,
            resource_type: 'image'
        })
        images.push({secure_url , public_id})
    }
    req.folder = `${destination}/products/${folderId}`

    //9- calculating applied price 
    const appliedPrice = basePrice - (basePrice * (discount ||0) / 100)

    //10- creating the product
    const product = {
        title,
        desc,
        slug,
        folderId,
        basePrice,
        discount,
        appliedPrice,
        stock,
        addedBy : _id,
        images,
        specs: JSON.parse(specs),
        brandId,
        categoryId,
        subCategoryId
    }

    //11- saving the product
    const productCreated = await Product.create(product)
    if(!productCreated){
        return next(new Error('something went wrong',{cause:400}))}
        
    req.savedDoc = {model: Product, _id: productCreated._id}

    res.status(201).json({message:'product added successfully',productCreated})

}

//================================================== update product =============================================//

export const updateProduct = async (req, res, next) => {
    //1- destructing the required data from request
    const { title, desc, basePrice, discount, stock, specs ,oldPublicId } = req.body
    const { productId } = req.query
    const { _id } = req.authUser

    //2- checking if the product exists
    const product = await Product.findById(productId)
    if(!product){return next(new Error('product does not exist',{cause:400}))}

    //3- checking authorty
    if(req.authUser.role!==systemRoles.SUPERADMIN && product.addedBy.toString()!== _id.toString()){return next(new Error('you are not authorized to update this product',{cause:400}))}

    //4-check updated fields
    if(title){product.title = title , product.slug = slugify(product.title,{lower:true,replacement:'-'}) }
    if(desc){product.desc = desc}
    if(basePrice){product.basePrice = basePrice}
    if(discount){product.discount = discount}
    product.appliedPrice = product.basePrice - (product.basePrice * (product.discount ||0) / 100)
    if(stock){product.stock = stock}
    if(specs){product.specs = JSON.parse(specs)}

    //5- check if updating images
    if(oldPublicId){
        if(!req.file){
            return next(new Error('you must provide a picture',{cause:400}))
        }
            const {public_id} = await cloudinaryConnection().uploader.upload(req.file.path,{
                resource_type: 'image',
                public_id: oldPublicId
            })
        for (const image of product.images) {
            if(image.public_id.toString() === oldPublicId){
                image.public_id = public_id
        }    
    }
}
    
    //6- updating the product
    const updatedProduct = await product.save()
    if(!updatedProduct){return next(new Error('something went wrong',{cause:400}))}

    res.status(200).json({message:'product updated successfully',updatedProduct})

}

//================================================== delete product ==========================================//

export const deleteProduct = async (req, res, next) => {

    //1- destructing the required data from request
    const { productId } = req.query
    const { _id } = req.authUser
    
    //2- checking if the product exists
    const product = await Product.findById(productId)
    if(!product){return next(new Error('product does not exist',{cause:400}))}

    //3- checking authorty
    if(req.authUser.role!==systemRoles.SUPERADMIN && product.addedBy.toString()!== _id.toString()){return next(new Error('you are not authorized to delete this product',{cause:400}))}

    //4- delete product images
    const lastSlashIndex = product.images[0].public_id.lastIndexOf('/') 
    const destination = product.images[0].public_id.slice(0,lastSlashIndex)
    await cloudinaryConnection().api.delete_resources_by_prefix(destination).catch(err => {console.log(err)})
    await cloudinaryConnection().api.delete_folder(destination).catch(err => {console.log(err)})

    //5- deleting the product
    const deletedProduct = await Product.findByIdAndDelete(productId)
    if(!deletedProduct){return next(new Error('something went wrong',{cause:400}))}

    res.status(200).json({message:'product deleted successfully',deletedProduct})

}

//============================================= get product by Id ================================================//

export const getProductById = async(req, res,next) =>{
    //1- destructing the required data from request
    const { productId } = req.query

    //2- checking if the product exists
    const product = await Product.findById(productId)
    if(!product){return next(new Error('product does not exist',{cause:400}))}

    res.status(200).json({message:'product fetched successfully',product})

}

//================================================== search for product =============================================//

export const searchProduct = async(req, res,next) =>{
    //1- destructing the required data from request
    const { ...query } = req.query

    const features = new ApiFeatures(req.query,Product.find()).search(query)
    const products = await features.mongooseQuery
 
    res.status(200).json({message:'matched products',products})

}

//================================================== get products for 2 brands  =============================================//

export const getProductsFor2Brand = async(req, res , next)=> {
    //1- destructing the required data from request
    const { firstBrandId ,secondBrandId } = req.query

    //2- checking if the first brand exists
    const firstBrand = await Brand.findById(firstBrandId)
    if(!firstBrand){return next(new Error('first brand does not exist',{cause:400}))}
    
    //3- checking if the second brand exists
    const secondBrand = await Brand.findById(secondBrandId)
    if(!secondBrand){return next(new Error('second brand does not exist',{cause:400}))}

    //4- getting the products for the 2 brands
    const products = await Product.find({brandId:{$in:[firstBrandId,secondBrandId]}})
    if(!products){return next(new Error('something went wrong',{cause:400}))}

    res.status(200).json({message:'products fetched successfully',products})
}

//================================================== get all products paginated =============================================//

export const getAllProducts = async(req, res,next) =>{
    //1- destructing the required data from request
    const { page , size  } = req.query

    const features = new ApiFeatures(req.query,Product.find()).pagination({page,size})
    const products = await features.mongooseQuery
 
    res.status(200).json({message:'products fetched successfully',products})

}

