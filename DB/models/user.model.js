import { Schema, model } from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.js";
import bcrypt from "bcryptjs"

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
        tirm: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        tirm: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    phoneNumbers: [{
        type: String,
        required: true,
    }],
    addresses: [{
        type: String,
        required: true
    }],
    role: {
        type: String,
        enum: [systemRoles.USER, systemRoles.ADMIN,systemRoles.SUPERADMIN,systemRoles.DELIEVER],
        default: systemRoles.USER
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    age: {
        type: Number,
        min: 18,
        max: 100
    },
    forgetCode:{
        type: String,
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    token:{
        type: String
    }
}, { timestamps: true })

userSchema.pre('save', function(){
    console.log(this.password)
    this.password = bcrypt.hashSync(this.password, +process.env.SALT_ROUNDS);
    console.log(this.password)
})

const User = model('User', userSchema)
export default User