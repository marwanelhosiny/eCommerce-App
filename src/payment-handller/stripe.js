import Stripe from "stripe"
import Coupon from "../../DB/models/coupon.model.js"


export const createCheckoutSession = async ({
    customer_email,
    metadata,
    success_url,
    cancel_url,
    discounts,
    line_items
})=>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const paymentData = await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        mode: 'payment',
        customer_email,
        metadata,
        success_url,
        cancel_url,
        discounts,
        line_items,
        
    })

    return paymentData
}

export const createStripeCoupon = async({couponId})=>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const coupon = await Coupon.findById(couponId)
    if(!coupon){return next(new Error('coupon not found',{cause:400}))}

    let couponObj = {}

    if(coupon.isFixed){
        couponObj={
            name: coupon.couponCode,
            amount_off : coupon.discountAmount * 100,
            currency : 'EGP'
        }
    }

    if(coupon.isPercentage){
        couponObj={
            name: coupon.couponCode,
            percent_off : coupon.discountAmount
            
        }
    }

    const stripeCoupon = await stripe.coupons.create(couponObj)

    return stripeCoupon
}

export const stripePaymentMethod = async ({token})=>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const paymentMethod = await stripe.paymentMethods.create({
        type:'card',
        card:{
            token
        }
    })
    return paymentMethod
}

export const createPaymentIntent = async ({amount,currency})=>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const paymentMethod = await stripePaymentMethod({token:'tok_visa'})
    const paymentIntent = await stripe.paymentIntents.create({
        amount:amount*100,
        currency,
        automatic_payment_methods:{
            enabled:true,
            allow_redirects:'never'
        },
        payment_method:paymentMethod.id
    })
    return paymentIntent
}

export const retrievePaymentIntent = async ({paymentIntentId})=>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    return paymentIntent
}

export const confirmPaymentIntent = async ({paymentIntentId})=>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const paymentDetails = await retrievePaymentIntent({paymentIntentId})

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId,{
        payment_method:paymentDetails.payment_method
    })

    return paymentIntent
}

export const refundPayment = async({paymentIntentId})=>{

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const refund = await stripe.refunds.create({

        payment_intent: paymentIntentId,
      })

    return refund  
}