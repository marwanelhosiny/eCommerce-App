import CouponUser from "../../../DB/models/coupon-users.model.js";
import Order from "../../../DB/models/order.model.js";
import Product from "../../../DB/models/product.model.js";
import Cart from "../../../DB/models/cart.model.js"

import { applyCouponValidation } from "../../utils/coupon.validation.js";
import { DateTime } from "luxon";
import { qrCodeGenerate } from "../../utils/qr-code.js";
import { confirmPaymentIntent, createCheckoutSession, createPaymentIntent, createStripeCoupon, refundPayment } from "../../payment-handller/stripe.js";
import { nanoid } from "nanoid";
import createInvoice from "../../utils/pdfKit.js"
import sendEmailService from "../services/send-email.service.js";


//================================================ create order ====================================//

export const creatOrder = async (req, res, next) => {
    //1- destructing required data
    const { address, city, postalCode, country, phoneNumbers, couponCode, paymentMethod } = req.body
    const { productId, quantity } = req.query
    const { _id: user } = req.authUser

    //2- validate coupon if sent
    let coupon = null
    if (couponCode) {
        const isCouponValid = await applyCouponValidation(couponCode, user)
        if (isCouponValid.status) { return next(new Error(isCouponValid.msg, { cause: isCouponValid.status })) }
        coupon = isCouponValid

    }

    //3- check if product exists and have stock
    const product = await Product.findById(productId)
    if (!product || product.stock < quantity) { return next(new Error('product not found', { cause: 400 })) }

    //4- preparing orderItems
    const orderItems = [{
        title: product.title,
        quantity,
        price: product.appliedPrice,
        product: productId
    }]

    //5- calculating prices
    const shippingPrice = product.appliedPrice * quantity
    let totalPrice = shippingPrice

    if (coupon?.isFixed && coupon?.discountAmount > shippingPrice) { return next(new Error('cant use this coupon', { cause: 400 })) }

    if (coupon?.isFixed) {
        totalPrice = shippingPrice - coupon.discountAmount
    } else if (coupon?.isPercentage) {
        totalPrice = shippingPrice - (shippingPrice * coupon.discountAmount / 100)
    }

    //6- order status and payment method
    let orderStatus;
    if (paymentMethod == 'Cash') orderStatus = 'Placed';

    const order = new Order({
        user,
        orderItems,
        shippingAddress: { address, city, postalCode, country },
        phoneNumbers,
        shippingPrice,
        coupon: coupon?._id,
        totalPrice,
        paymentMethod,
        orderStatus
    })

    await order.save()

    product.stock -= quantity
    await product.save()

    if (coupon) {
        await CouponUser.updateOne({ userId: user, couponId: coupon._id }, { $inc: { usageCount: 1 } })
    }

    const QRcode = await qrCodeGenerate([{
        user,
        orderItems,
        shippingAddress: { address, city, postalCode, country },
        phoneNumbers,
        shippingPrice,
        coupon: coupon?._id,
        totalPrice,
        paymentMethod,
        orderStatus
    }])

    //invoice
    const orderCode = `${req.authUser.username}_${nanoid(3)}`
    const orderInvoice = {
        shipping: {
            name: req.authUser.username,
            address: address,
            city: "cairo",
            state: "cairo"
        },
        orderCode,
        items: orderItems,
        date: order.createdAt,
        subTotal: order.totalPrice,
        paidAmount: order.paidAmount
    }

    createInvoice(orderInvoice, `${orderCode}.pdf`)
    await sendEmailService({
        to: req.authUser.email,
        subject: "Order Confirmation",
        message: '<h1>your order invoice</h1>',
        attachments: [{
            path: `./Files/${orderCode}.pdf`
        }]
        
    })

    res.status(201).json({ message: "order created successfully", order, QRcode })

}

//===================== convert cart to an order =======================//

export const convertCartToOrder = async (req, res, next) => {
    //1- destructing required data
    const { address, city, postalCode, country, phoneNumbers, couponCode, paymentMethod } = req.body
    const { _id: user } = req.authUser

    //2- validate coupon if sent
    let coupon = null
    if (couponCode) {
        const isCouponValid = await applyCouponValidation(couponCode, user)
        if (isCouponValid.status) { return next(new Error(isCouponValid.msg, { cause: isCouponValid.status })) }
        coupon = isCouponValid

    }

    //3- check if user has a cart
    const cart = await Cart.findOne({ userId: user })
    if (!cart) { return next(new Error('you have no cart', { cause: 400 })) }

    //4- preparing orderItems
    const orderItems = cart.products.map((ele) => {
        return {
            title: ele.title,
            quantity: ele.quantity,
            price: ele.basePrice,
            product: ele.productId
        }
    })

    //5- calculating prices
    const shippingPrice = cart.subTotal
    let totalPrice = shippingPrice

    if (coupon?.isFixed && coupon?.discountAmount > shippingPrice) { return next(new Error('cant use this coupon', { cause: 400 })) }

    if (coupon?.isFixed) {
        totalPrice = shippingPrice - coupon.discountAmount
    } else if (coupon?.isPercentage) {
        totalPrice = shippingPrice - (shippingPrice * coupon.discountAmount / 100)
    }

    //6- order status and payment method
    let orderStatus;
    if (paymentMethod == 'Cash') orderStatus = 'Placed';

    const order = new Order({
        user,
        orderItems,
        shippingAddress: { address, city, postalCode, country },
        phoneNumbers,
        shippingPrice,
        coupon: coupon?._id,
        totalPrice,
        paymentMethod,
        orderStatus
    })

    await order.save()

    for (const item of orderItems) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } })
    }

    if (coupon) {
        await CouponUser.updateOne({ userId: user, couponId: coupon._id }, { $inc: { usageCount: 1 } })
    }

    const QRcode = await qrCodeGenerate([{
        user,
        orderItems,
        shippingAddress: { address, city, postalCode, country },
        phoneNumbers,
        shippingPrice,
        coupon: coupon?._id,
        totalPrice,
        paymentMethod,
        orderStatus
    }])

    res.status(201).json({ message: "order created successfully", order })

}

//========================================== deliver order ================================//
export const delieverOrder = async (req, res, next) => {
    //1-destruct required data
    const { orderId } = req.params
    const { _id } = req.authUser

    //2-check if order exists
    const order = await Order.findOneAndUpdate({
        _id: orderId,
        orderStatus: { $in: ['Paid', 'Placed'] }
    }, {
        isDelivered: true,
        orderStatus: 'Deliverd',
        deliverdBy: _id,
        deliverdAt: DateTime.now().toFormat('yyyy-mm-dd HH:mm:ss')
    }, {
        new: true
    })
    if (!order) { return next(new Error('order not found or cant be deliverd right now', { cause: 400 })) }
    res.status(200).json({ message: 'order deliverd successfully', order })
}

//====================================== payment with stripe ================================//
export const payWithStripe = async (req, res, next) => {

    //1-destructing required data
    const { orderId } = req.query
    const { _id: userId } = req.authUser

    //2-get order details from database
    const order = await Order.findOne({ _id: orderId, user: userId, orderStatus: 'Pending' })
    if (!order) { return next(new Error('order not found or cannot be paid')) }

    //3-preparing payment obj
    const paymentObject = {
        customerEmail: req.authUser.email,
        metadata: { orderId: order._id.toString() },
        discounts: [],
        success_url: `http://localhost:3000/success`,
        cancel_url: `http://localhost:3000/cancel`,
        line_items: order.orderItems.map((itm) => {
            return {
                price_data: {
                    currency: 'egp',
                    product_data: {
                        name: itm.title
                    },
                    unit_amount: itm.price * 100
                },
                quantity: itm.quantity
            }
        })
    }

    if (order.coupon) {
        const stripeCoupon = await createStripeCoupon({ couponId: order.coupon });
        if (stripeCoupon.status) return next({ message: stripeCoupon.message, cause: 400 });

        paymentObject.discounts.push({
            coupon: stripeCoupon.id
        });
    }

    //4-paying with stripe
    const payment = await createCheckoutSession(paymentObject)
    const paymentIntent = await createPaymentIntent({
        amount: order.totalPrice,
        currency: 'EGP'
    })
    order.payment_intent = paymentIntent.id
    await order.save()

    res.status(200).json(payment)
}

//============================================ stripeWebHookLocal =====================================//
export const stripeWebHookLocal = async (req, res, next) => {
    const orderId = req.body.data.object.metadata.orderId

    const order = await Order.findById({ _id: orderId })
    if (!order) return next({ message: 'order not found', cause: 404 })

    const confirmPaymentIntentDetails = await confirmPaymentIntent({ paymentIntentId: order.payment_intent })

    const updatedOrder = await Order.updateOne({ _id: orderId }, {
        orderStatus: 'Paid',
        paidAt: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
        isPaid: true
    })

    res.status(200).json({ message: 'web hook recived' })
}

//============================================= refund api ===========================================//
export const paymentRefund = async (req, res, next) => {
    const { orderId } = req.query

    const order = await Order.findById({ _id: orderId, isPaid: true })
    if (!order) return next({ message: 'order not found or not paid', cause: 404 })

    const refund = await refundPayment({ paymentIntentId: order.payment_intent })

    order.orderStatus = 'Refunded',
        order.isPaid = false

    await order.save()

    res.status(200).json({ message: 'payment refunded successfully', refund })
}