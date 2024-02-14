import slugify from "slugify";
import User from "../../../DB/models/user.model.js";
import sendEmailService from "../services/send-email.service.js";
import  jwt  from "jsonwebtoken";






//============================================= update user profile=================================//

export const updateUserProfile = async (req, res, next) => {
    //1- destructing the required data from request
    const { _id } = req.authUser;
    const { username, email, phoneNumbers, addresses } = req.body;

    //2- checking if user exists
    const user = await User.findById(_id);
    if (!user) {
        return next(new Error('user does not exist', { cause: 400 }));
    }

    //3- checking if the name sent and not the same old name and not already taken
    if (username) {
        if (username == user.username) {
            return next(new Error('username is typlcaly same as the old name', { cause: 400 }));
        }
        //3-1-update the user name and slug
        user.username = username;
        user.slug = slugify(username, { lower: true, replacement: "-" });
    }

    //4-update phoneNumber
    if (phoneNumbers) {
        user.phoneNumbers = phoneNumbers
    }
    
    //5-update address
    if (addresses) { 
        user.addresses = addresses
    } 

    //6- checking if email sent
    if (email) {
        if (email == user.email) {
            return next(new Error('email is typlcaly same as the old name', { cause: 400 }));
        }
        const isExist = await User.findOne({ email });
        if (isExist) {
            return next(new Error('email already exist', { cause: 400 }));
        }
    }

    //7-update email
        user.email = email;
        user.isEmailVerified = false;

    //7-1send verification mail
    const usertoken = jwt.sign({email},process.env.USERTOKEN_SECRET_KEY,{expiresIn:'2m'})
    const message = `<h1>hello</h1>
    <a href="http://localhost:3000/user/verify-email/?usertoken=${usertoken}">verify your email</a>`
    const confirmMail = sendEmailService({to:email,message})

    //8-saving user
    const updatedUser = await user.save();


    res.status(200).json({message: "success", data: updatedUser});
};



//================================================================ delete user =================================================================//

export const deleteUser = async (req, res, next) => {
    //1- destructing the required data from request
    const { _id } = req.authUser;

    //2- delete user
    const deletedUser = await User.findByIdAndDelete(_id);
    if (!deletedUser) {
        return next(new Error('something went wrong', { cause: 400 }));
    }

    res.status(200).json({ message: "user deleted successfully" });
};


//======================================================= show user profile ============================//

export const showUserProfile = async (req, res, next) => {
    //1- destructing the required data from request
    const { _id } = req.authUser;

    //2- find user
    const user = await User.findById(_id,'- password');
    if (!user) {
        return next(new Error('user does not exist', { cause: 400 }));
    }

    res.status(200).json({ message: "user fetched successfully", data: user });
};