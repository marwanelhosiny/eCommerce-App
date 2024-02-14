import nodemailer from "nodemailer"


const sendEmailService = async({
    to = '',
    subject= 'no-reply',
    message =  '',
    attachments = []
})=>{
    //email configration
    const transporter = nodemailer.createTransport({
        host:"localhost",
        service:"gmail",
        port:587,
        secure:false,
        auth:{
            user: process.env.EMAIL,
            pass:process.env.EMAIL_PASS
        }
    })

    const info = await transporter.sendMail({
        from:`${process.env.EMAIL}`,
        to,
        subject,
        html : message,
        attachments
    })
    console.log(info)
}

export default sendEmailService