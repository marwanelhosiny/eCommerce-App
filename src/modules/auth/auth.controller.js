import User from "../../../DB/models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import generateUniequeString from "../../utils/generateUniqueString.js"
import axios from "axios"
import sendEmailService from "../services/send-email.service.js"

//============================================== register api =======================================//
export const signUp = async (req, res, next) => {
    //destructing enteries from req
    const { username, email, password, addresses, age, role, phoneNumbers } = req.body

    //checking if email duplicated
    const isExist = await User.findOne({ email })
    if (isExist) { return next(new Error('duplicated entry', { cause: 400 })) }

    //creating document with all required data
    const addUser = new User({ username, email, password, addresses, age, role, phoneNumbers })
    await addUser.save()

    //send verification mail
    const usertoken = jwt.sign({ email }, process.env.USERTOKEN_SECRET_KEY, { expiresIn: 60 })

    const message = `<h1>hello</h1>
    <a href="${req.protocol}://${req.headers.host}/user/verify-email/?usertoken=${usertoken}">verify your email</a>`
    const confirmMail = sendEmailService({ to: email, message })

    return res.status(201).json({ message: 'user registered successfully' }, addUser)

}

//================================================ verify-email =====================================//

export const verifyEmail = async (req, res, next) => {
    const { usertoken } = req.query

    const decodedData = jwt.verify(usertoken, process.env.USERTOKEN_SECRET_KEY)
    if (!decodedData) { return next(new Error('usertoken expired', { cause: 400 })) }

    const isEmailExist = await User.findOneAndUpdate({ email: decodedData.email, isEmailVerified: false }, { isEmailVerified: true }, { new: true })
    if (!isEmailExist) { return next(new Error('email you trying to verify not found', { cause: 400 })) }

    return res.status(200).json({ message: 'email verified successfully' })
}


//============================================= login api ==========================================//
export const signIn = async (req, res, next) => {
    const { email, password } = req.body

    //checking email accuaracy and changing status too
    const isExist = await User.findOne({ email, isEmailVerified: true })

    if (!isExist) { return next(new Error('invalid credentials', { cause: 400 })) }

    //checking password accuaracy
    const checkPass = bcrypt.compareSync(password, isExist.password)
    if (!checkPass) { return next(new Error('invalid credentials', { cause: 400 })) }

    //creating token to send back in the response
    const { username, _id } = isExist
    const token = jwt.sign({ email, username, _id }, process.env.ACCESSTOKEN_SECRET_KEY, { expiresIn: "1 h" })

    //save token in db
    const updated = await User.findByIdAndUpdate({ _id:isExist._id }, { token })

    return res.status(200).json({ message: "you signed in successfully", token })
}


//=========================================== updateUser api ========================================//
export const userUpdate = async (req, res, next) => {
    const { email, mobileNumber, recoveryEmail, DOB, lastName, firstName } = req.body
    const { _id } = req.authUser

    //setting new username for user if he updates one of his names
    let username;
    if (firstName && lastName) { username = `${firstName}${lastName}` }
    else if (firstName) { username = `${firstName}${req.authUser.lastName}` }
    else if (lastName) { username = `${req.authUser.firstName}${lastName}` }

    //checking if email or mobilePhone duplicated
    const isExist = await User.findOne({ $or: [{ email }, { mobileNumber }] })
    if (isExist) { return next(new Error('duplicated entry', { cause: 400 })) }

    //updating the sent fields and returning the new document 
    const updated = await User.findByIdAndUpdate({ _id }, { username, firstName, lastName, email, mobileNumber, recoveryEmail, DOB }, { new: true })
    return res.status(200).json({ messsage: "user updated successsfully", updated })
}


//=========================================== deleteUser api ======================================//
export const userDelete = async (req, res, next) => {
    const { _id } = req.authUser

    //deleting user and returning deleted document 
    const deleted = await User.findByIdAndDelete({ _id })
    return res.status(200).json({ messsage: "user deleted successsfully", deleted })
}


//=========================================== showMyProfile api =================================//
export const showMyData = async (req, res, next) => {

    //distructing all data except password cannot send hashed pass in response even if he is account owner
    const { _id, firstName, lastName, username, email, DOB, mobileNumber, role, status, createdAt, updatedAt } = req.authUser
    return res.status(200).json({ _id, firstName, lastName, username, email, DOB, mobileNumber, role, status, createdAt, updatedAt })

}


//=========================================== showUserProfile api =================================//
export const showUserProfile = async (req, res, next) => {
    const { _id } = req.params

    const findUser = await User.findById(_id, 'firstName lastName DOB role status')
    if (!findUser) { return next(new Error('user does not exist', { cause: 400 })) }
    return res.status(200).json({ message: `user's profile`, findUser })
}


//=========================================== updatePassword api ===============================//
export const changePass = async (req, res, next) => {
    const { newPass, oldPass } = req.body
    console.log(newPass)
    const { _id } = req.authUser

    //check old pass
    const checkPass = bcrypt.compareSync(oldPass, req.authUser.password)
    if (!checkPass) { return next(new Error('invalid credentials', { cause: 400 })) }

    //hashing the new pass
    const hashedPass = bcrypt.hashSync(newPass, 9)


    //updating database
    const passUpdate = await User.updateOne({ _id }, { password: hashedPass })
    if (!passUpdate.modifiedCount) { return next(new Error('update failed', { cause: 400 })) }
    return res.status(200).json({ message: "password updated Successfully", passUpdate })
}


//========================================== forgetPassword========================================//
export const forgetPassword = async (req, res, next) => {
    const { email } = req.body

    //check if email accurate
    const isExist = await User.findOne({ email })
    if (!isExist) { return next(new Error('invalid email', { cause: 400 })) }

    //set forget code and send it in email
    const forgetCode = generateUniequeString()
    const hashCode = bcrypt.hashSync(forgetCode, +process.env.SALT_ROUNDS)
    const token = jwt.sign({ email, forgetCode }, process.env.USERTOKEN_SECRET_KEY, {
        expiresIn: "1h"
    })
    await User.updateOne({ email }, { forgetCode: hashCode })
    const message = `<h1>hello</h1>
    <a href="${req.protocol}://${req.headers.host}/user/reset/${token}">reset your password</a>`
    const confirmMail = sendEmailService({ to: email, message })

    return res.status(200).json({ message: "email sent successfully" })

}


//========================================== resetPass ========================================//

export const resetPass = async (req, res, next) => {
    const { token } = req.params
    const { newPass } = req.body


    //decode token
    const decodedData = jwt.verify(token, process.env.USERTOKEN_SECRET_KEY)
    if (!decodedData) { return next(new Error('usertoken expired', { cause: 400 })) }

    //find user
    const findUser = await User.findOne({ email: decodedData.email })
    if (!findUser) { return next(new Error('user does not exist', { cause: 400 })) }

    //compare forgetCode
    const checkCode = bcrypt.compareSync(decodedData.forgetCode, findUser.forgetCode)
    if (!checkCode) { return next(new Error('invalid code', { cause: 400 })) }

    //updating user with the new password
    findUser.password = newPass
    findUser.forgetCode = null
    await findUser.save()
    return res.status(200).json({ message: "password updated Successfully", findUser })

}

