const bcrypt = require("bcryptjs")
const staffModel = require("../models/staffModel")


const resetPassword = async(req, res)=>{
    try {
        const {token} = req.params
        const {newPassword} = req.body

        const staff = await staffModel.findOne({
            resetPasswordToken: token, 
            resetPasswordExpires: {$gt: Date.now()
            }})
            if(!staff){
                return res.status(400).json({
                    success: false,
                    message: "Invalid or expired token"
                })
            }

            //hashing password
            const salt = await bcrypt.genSalt(10)
            staff.password= await bcrypt.hash(newPassword, salt)

          //clear reset token and expiration
            staff.resetPasswordToken = undefined
            staff.resetPasswordExpires = undefined

            await staff.save()

            return res.json({
                success: true,
                message: "Password reset successful"
            })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal sever error"
        })
    }

}

module.exports = resetPassword