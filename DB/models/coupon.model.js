import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    couponCode:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    discountAmount:{
        type: Number,
        required: true,
        min:1
    },
    couponStatus:{
        type: String,
        default: 'valid',
        enum: ['valid', 'expired','disabled'],
    },
    fromDate:{
        type: String,
        required: true,
    },
    toDate:{
        type: String,
        required: true,
    },
    isFixed:{
        type: Boolean,
        default: false,
        
    },
    isPercentage:{
        type: Boolean,
        default: false,
    },
    addedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    disabledBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    disabledAt:{
        type: String,
    },
    enabledBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    enabledAt:{
        type: String,
    }
    

}, { timestamps: true });

const Coupon=  mongoose.model('coupon', couponSchema)

export default Coupon

