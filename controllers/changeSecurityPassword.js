const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const staffModel = require("../models/staffModel.js")

const changeSecurityPassword = async(req,res)=>{
    try {
        const {securityId, temporaryPassword, newPassword} = req.body

       if(!securityId || !temporaryPassword || !newPassword){
         return res.status(400).json({
            success: false,
            message: "Security ID, new password and temporary Password are required"
        })
    }

      //find the security user
       const security = await staffModel.findOne({securityId, role: "security"})
       if(!security){
         return res.status(404).json({
            success: false,
            message: "Security not found"
        })
    } 
    //Verify temporary password
    const isMatch = await bcrypt.compare(temporaryPassword, security.password)
    if(!isMatch){
      return res.status(401).json({
        success: false,
        message: "Temporary password is required"
      })
    }

      //Only allow change password if its the security first login
      if(!security.changePassword){
        return res.status(404).json({
          success: false,
          message: "Password change not allowed"
        })
    }

      //hash the new password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)

      //update password
      security.password = hashedPassword
      security.changePassword = false

      await security.save()

      return res.status(200).json({
        success: true,
        message: "Password changed successfully"
    })

    } catch (error) {
        console.error("Change password error: ", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}



module.exports = changeSecurityPassword