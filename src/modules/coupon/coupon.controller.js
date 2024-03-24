import Coupon from "../../../DB/models/coupon.model.js"
import User from "../../../DB/models/user.model.js"
import CouponUser from "../../../DB/models/coupon-users.model.js"
import { DateTime } from "luxon"




//=============================================== add coupon ========================================//

export const addCoupon = async (req, res, next) => {
    //1- destructing the required data from request
    const { _id: addedBy } = req.authUser
    const { couponCode, discountAmount, fromDate, toDate, isPercentage, isFixed, users } = req.body

    //2- checking if the name is already taken
    const coupon = await Coupon.findOne({ couponCode })
    if (coupon) { next(new Error('duplicated coupon code', { cause: 400 })) }

    if (isFixed === isPercentage) { return next(new Error('coupon amount can be either fixed or precentage', { cause: 400 })) }

    if (isPercentage) {
        if (discountAmount < 0 || discountAmount > 100) { return next(new Error('discount amount must be between 0 and 100', { cause: 400 })) }
    }

    //3- creating the coupon
    const newCoupon = await Coupon.create({
        couponCode,
        discountAmount,
        fromDate,
        toDate,
        isPercentage,
        isFixed,
        addedBy
    })

    //4- assign coupon to users
    let userIds = []
    for (const user of users) {
        userIds.push(user.userId)
    }

    //4-1 check if users exists
    const usersExist = await User.find({ _id: { $in: userIds } })
    if (usersExist.length != users.length) {
        return next(new Error('users does not exist', { cause: 400 }))
    }

    //4-2 saving coupon users
    const newCouponUsers = await CouponUser.create(users.map(user => ({ ...user, couponId: newCoupon._id })))
    //5- returning the coupon
    res.status(201).json({
        message: "Coupon added successfully",
        coupon: newCoupon
    })
}

//=============================================== disable coupon ========================================//

export const disableCoupon = async (req, res, next) => {
    const { couponId } = req.params
    const { _id } = req.authUser

    //checking if coupon exists and not disabled or expired
    const coupon = await Coupon.findOneAndUpdate({ _id: couponId, couponStatus: "valid" }
        , { couponStatus: 'disabled', disabledBy: _id, disabledAt: DateTime.now() }, { new: true })
    if (!coupon) { return next(new Error('coupon not found', { cause: 400 })) }

    res.status(200).json({ message: "Coupon disabled successfully", coupon })
}

//=============================================== enable coupon ========================================//

export const enableCoupon = async (req, res, next) => {
    const { couponId } = req.params
    const { _id } = req.authUser

    // checking if coupon exists and disabled
    const coupon = await Coupon.findOneAndUpdate({ _id: couponId, couponStatus: "disabled" }
        , { couponStatus: 'valid', enabledBy: _id, enabledAt: DateTime.now() }, { new: true })
    if (!coupon) { return next(new Error('coupon not found', { cause: 400 })) }

    res.status(200).json({ message: "Coupon enabled successfully", coupon })
}

//============================================== get all disabled coupons =====================================//

export const getAllDisabledCoupons = async (req, res, next) => {
    const coupons = await Coupon.find({ couponStatus: "disabled" })
    res.status(200).json({ message: "All disabled coupons", coupons })
}

//============================================== get all valid coupons =====================================//

export const getAllValidCoupons = async (req, res, next) => {
    const coupons = await Coupon.find({ couponStatus: "valid" })
    res.status(200).json({ message: "All valid coupons", coupons })
}

//============================================ get coupon by id ============================================//

export const getCouponById = async (req, res, next) => {
   
    const { couponId } = req.params

    const coupon = await Coupon.findById(couponId)

    if (!coupon) { return next(new Error('coupon not found', { cause: 400 })) }

    res.status(200).json({ message: "Coupon found", coupon })
}

//============================================ updateCoupon ============================================//

export const updateCoupon = async (req, res, next) => {
    const { couponId } = req.params
    const {  discountAmount, fromDate, toDate } = req.body

    //checking if coupon exists and not disabled or expired
    const coupon = await Coupon.findOne({ _id: couponId, couponStatus: "valid" })
    if (!coupon) { return next(new Error('coupon not found', { cause: 400 })) }

    //checking fields need to be updated
    if (discountAmount) { coupon.discountAmount = discountAmount }
    if (fromDate) { coupon.fromDate = fromDate }
    if (toDate) { coupon.toDate = toDate }

    coupon.updatedBy = req.authUser._id

    await coupon.save()
    res.status(200).json({ message: "Coupon updated successfully", coupon })
}