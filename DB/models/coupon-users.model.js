import mongoose from "mongoose";

const couponUserSchema = new mongoose.Schema({
    couponId:{
        type: mongoose.Types.ObjectId,
        ref: 'coupon',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usageCount:{
        type: Number,
        default: 0,
        min:0
    },
    maxUsage:{
        type: Number,
        required: true,
        min:1
    }
}, { timestamps: true });

const CouponUser=  mongoose.model('couponUser', couponUserSchema)

export default CouponUser

