const crypto = require("crypto")
const staffModel = require("../models/staffModel.js")
const bcrypt = require("bcryptjs")
const {validationResult} = require("express-validator")

const sendResetEmail = require("../utils/mailer.js")

const forgotPassword = async(req, res)=>{
    console.log("forgot password hit")
    try {
        const {email}  = req.body
        if(!email){
            return res.status(400).json({
                success: false,
                message: "Email is required"
            })
        }
        console.log(email)
        const staff = await staffModel.findOne({email})
        console.log(staff)
        if(!staff){
            return res.status(404).json({
                success: false,
                message: "No account with this mail"
            })
        }
        //create token
        const token = crypto.randomBytes(32).toString("hex")
        console.log("token generated")

        //saving token to staff document
        staff.resetPasswordToken = token

        //token expiry time
        staff.resetPasswordExpires = Date.now() + 10* 60* 1000
        await staff.updateOne(
            {email},
            {resetToken: token}
        )
        console.log("staff saved")

        const resetLink = `http://localhost:5173/resetPassword/${token}`

        await sendResetEmail(staff.email, resetLink)

        return res.status(201).json({
            success: true,
            message: "Password reset link sent to email"
        })

    }catch (error) {
            console.error("Forgot Password Error:", error)
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message 
            })
        }
}

module.exports = forgotPassword