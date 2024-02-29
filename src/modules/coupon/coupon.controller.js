import Coupon from "../../../DB/models/coupon.model.js"
import User from "../../../DB/models/user.model.js"
import CouponUser from "../../../DB/models/coupon-users.model.js"




//=============================================== add coupon ========================================//

export const addCoupon = async (req,res,next) =>{
    //1- destructing the required data from request
    const { _id : addedBy } = req.authUser
    const {couponCode,discountAmount,fromDate , toDate ,isPercentage , isFixed ,users} = req.body

    //2- checking if the name is already taken
    const coupon = await Coupon.findOne({couponCode})
    if(coupon){next(new Error('duplicated coupon code',{cause:400}))}

    if(isFixed === isPercentage){return next(new Error('coupon amount can be either fixed or precentage',{cause:400}))}

    if(isPercentage){
        if(discountAmount < 0 || discountAmount > 100){return next(new Error('discount amount must be between 0 and 100',{cause:400}))}
    }

    //3- creating the coupon
    const newCoupon = await Coupon.create({
        couponCode,
        discountAmount,
        fromDate ,
        toDate ,
        isPercentage ,
        isFixed,
        addedBy})

    //4- assign coupon to users
    let userIds = []
    for (const user of users) {
        userIds.push(user.userId)
    }

    //4-1 check if users exists
    const usersExist = await User.find({_id:{$in:userIds}})
    if(usersExist.length!= users.length){
        return next(new Error('users does not exist',{cause:400}))
    }

    //4-2 saving coupon users
    const newCouponUsers = await CouponUser.create(users.map(user => ({...user,couponId:newCoupon._id})))
    //5- returning the coupon
    res.status(201).json({
        message: "Coupon added successfully",
        coupon: newCoupon
    })
}