import Product from "../../../DB/models/product.model.js";
import Brand from "../../../DB/models/brand.model.js";
import generateUniequeString from "../../utils/generateUniqueString.js";
import slugify from "slugify";
import cloudinaryConnection from "../../utils/cloudinary.js";
import { systemRoles } from "../../utils/system-roles.js";



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
    const appliedPrice = basePrice - (basePrice * discount ||0 / 100)

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