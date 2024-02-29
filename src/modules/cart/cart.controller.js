import Cart from "../../../DB/models/cart.model.js";
import Product from "../../../DB/models/product.model.js";



//=============================================== addToCart =================================//

export const addToCart = async (req, res, next) => {
    //1- destructing the required data from request
    const { _id } = req.authUser
    const {quantity,productId} = req.query

    //2- checking if the product exists
    const product = await Product.findById(productId)
    if(!product){return next(new Error('product does not exist',{cause:400}))}

    //3- checking for remaining quantity
    if(product.quantity < +quantity){return next(new Error('product is out of stock',{cause:400}))}

    //4- checking if user has a cart
    const cart = await Cart.findOne({userId:_id})
    if(!cart){
        const newCart = new Cart({
            userId:_id,
            products:[
                {
                    productId:productId,
                    quantity:+quantity,
                    basePrice:product.appliedPrice,
                    finalPrice:product.appliedPrice * +quantity,
                    title:product.title
                }
            ],
            subTotal: product.appliedPrice * +quantity
        })
        await newCart.save()
        return res.status(201).json(newCart)
    }

    //5- checking if the product is already in the cart
    const productInCart = cart.products.find(p => p.productId.toString() === productId)
    if(!productInCart){
        const newProduct = {
            productId:productId,
            quantity:+quantity,
            basePrice:product.appliedPrice,
            finalPrice:product.appliedPrice * +quantity,
            title:product.title
        }
        cart.products.push(newProduct)
        cart.subTotal += newProduct.finalPrice

        await cart.save()
        return res.status(200).json(cart)
    }

    for (const product of cart.products) {
        if(product.productId.toString() === productId){
            product.quantity = +quantity
            product.finalPrice = product.basePrice * product.quantity
        }
    }

    let sum = cart.products.reduce((prevValue,currValue)=>{return prevValue + currValue.finalPrice},0)
    cart.subTotal = sum
    console.log(cart)
    await cart.save()
    return res.status(200).json(cart)
        
    };


//===================================================== remove product from cart==========================//


export const removeFromCart = async (req, res, next) => {
    //1- destructing the required data from request
    const { _id } = req.authUser
    const {productId} = req.query

    //2- checking if user has a cart and it contains the product
    const cart = await Cart.findOne({userId:_id,'products.productId':productId})
    if(!cart){return next(new Error('cart does not exist',{cause:400}))}

    //3-removing product from cart
    cart.products = cart.products.filter(p => p.productId.toString()!== productId)
    cart.subTotal = cart.products.reduce((prevValue,currValue)=>{return prevValue + currValue.finalPrice},0)
    
    //4-deleting cart if empty
    if(cart.products.length === 0){
        await Cart.findOneAndDelete({userId:_id})
        return res.status(200).json({message:"empty cart deleted",cart})
    }
    await cart.save()

    return res.status(200).json({message:"product removed from cart",cart})
}