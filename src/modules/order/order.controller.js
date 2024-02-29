import CouponUser from "../../../DB/models/coupon-users.model.js";
import Order from "../../../DB/models/order.model.js";
import Product from "../../../DB/models/product.model.js";
import Cart from "../../../DB/models/cart.model.js"

import { applyCouponValidation } from "../../utils/coupon.validation.js";
import { DateTime } from "luxon";


//================================================ create order ====================================//

export const creatOrder = async (req,res,next)=>{
    //1- destructing required data
    const { address, city, postalCode, country , phoneNumbers, couponCode , paymentMethod } = req.body
    const { productId , quantity } = req.params
    const { _id : user } = req.authUser

    //2- validate coupon if sent
    let coupon = null
    if(couponCode){
        const isCouponValid = await applyCouponValidation(couponCode,user)
        if(isCouponValid.status){return next(new Error(isCouponValid.msg , {cause:isCouponValid.status}))}
        coupon = isCouponValid   

    }

    //3- check if product exists and have stock
    const product = await Product.findById(productId)
    if(!product || product.stock < quantity){return next(new Error('product not found', {cause:400}))}

    //4- preparing orderItems
    const orderItems = [{
        title : product.title,
        quantity ,
        price : product.appliedPrice,
        product : productId
    }]

    //5- calculating prices
    const shippingPrice = product.appliedPrice * quantity
    let totalPrice = shippingPrice

    if(coupon?.isFixed && coupon?.discountAmount > shippingPrice){return next(new Error('cant use this coupon', {cause:400}))}

    if(coupon?.isFixed){
        totalPrice = shippingPrice - coupon.discountAmount
    }else if(coupon?.isPercentage){
        totalPrice = shippingPrice - (shippingPrice * coupon.discountAmount/100)
    }

    //6- order status and payment method
    let orderStatus;
    if(paymentMethod == 'Cash')orderStatus = 'Placed';

    const order = new Order ({
        user,
        orderItems,
        shippingAddress : { address, city, postalCode, country },
        phoneNumbers,
        shippingPrice,
        coupon : coupon?._id,
        totalPrice,
        paymentMethod,
        orderStatus
    })

    await order.save()

    product.stock -= quantity
    await product.save()

    if(coupon){
        await CouponUser.updateOne({userId:user,couponId:coupon._id},{$inc:{usageCount:1}})
    }

    res.status(201).json({message:"order created successfully", order})
    
}

//==================================================== convert cart to an order =======================//

export const convertCartToOrder = async (req,res,next)=>{
    //1- destructing required data
    const { address, city, postalCode, country , phoneNumbers, couponCode , paymentMethod } = req.body
    const { _id : user } = req.authUser

    //2- validate coupon if sent
    let coupon = null
    if(couponCode){
        const isCouponValid = await applyCouponValidation(couponCode,user)
        if(isCouponValid.status){return next(new Error(isCouponValid.msg , {cause:isCouponValid.status}))}
        coupon = isCouponValid   

    }

    //3- check if user has a cart
    const cart = await Cart.findOne({userId:user})
    if(!cart){return next(new Error('you have no cart', {cause:400}))}

    //4- preparing orderItems
    const orderItems = cart.products.map((ele)=>{return {
        title : ele.title,
        quantity : ele.quantity,
        price : ele.basePrice,
        product:ele.productId
    }})

    //5- calculating prices
    const shippingPrice = cart.subTotal 
    let totalPrice = shippingPrice

    if(coupon?.isFixed && coupon?.discountAmount > shippingPrice){return next(new Error('cant use this coupon', {cause:400}))}

    if(coupon?.isFixed){
        totalPrice = shippingPrice - coupon.discountAmount
    }else if(coupon?.isPercentage){
        totalPrice = shippingPrice - (shippingPrice * coupon.discountAmount/100)
    }

    //6- order status and payment method
    let orderStatus;
    if(paymentMethod == 'Cash')orderStatus = 'Placed';

    const order = new Order ({
        user,
        orderItems,
        shippingAddress : { address, city, postalCode, country },
        phoneNumbers,
        shippingPrice,
        coupon : coupon?._id,
        totalPrice,
        paymentMethod,
        orderStatus
    })

    await order.save()

    for (const item of orderItems) {
        await Product.updateOne({_id : item.product}, {$inc:{stock : -item.quantity }})
    }

    if(coupon){
        await CouponUser.updateOne({userId:user,couponId:coupon._id},{$inc:{usageCount:1}})
    }

    res.status(201).json({message:"order created successfully", order})
    
}

//========================================== deliver order ================================//
export const delieverOrder = async(req,res,next)=>{
    //1-destruct required data
    const {orderId} = req.params
    const {_id} = req.authUser

    //2-check if order exists
    const order = await Order.findOneAndUpdate({
        _id:orderId,
        orderStatus:{$in:['Paid','Placed']}
    },{
        isDelivered:true,
        orderStatus:'Deliverd',
        deliverdBy:_id,
        deliverdAt : DateTime.now().toFormat('yyyy-mm-dd HH:mm:ss')
    },{
        new:true
    })
    if(!order){return next(new Error('order not found or cant be deliverd right now',{cause:400}))}
    res.status(200).json({message:'order deliverd successfully',order})
}