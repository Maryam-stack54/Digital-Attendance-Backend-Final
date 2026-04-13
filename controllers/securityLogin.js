const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const staffModel = require("../models/staffModel.js")

const securityLogin = async(req, res)=>{
    try {
        const {securityId, password} = req.body

        if(!securityId || !password){
            return res.status(400).json({
                success: false,
                message: "Security ID and Password are required"
            })
        }

        // find security staff by securityId
        const security = await staffModel.findOne({securityId, role: "security"})
        if(!security){
            return res.status(404).json({
                success: false,
                message: "No security account found with this ID"
            })
        }

        //Compare Password
        const isValid = bcrypt.compareSync(password, security.password )
          if(!isValid){
            return res.status(404).json({
                success: false,
                message: "Incorrect Password"
            })
        }
        // check if must change password 
        if(security.changePassword){
            return res.status(200).json({
                changePassword: true,
                message: "First Login: Password change required"
            })
        }

        //Generate JWT
        const token = jwt.sign(
            {id: security._id, role: security.role},  
            process.env.JWT_SECRET,
            { expiresIn: "1hr" }  
          )
  
          res.
             cookie("token", token,{
             maxAge: 1000* 60* 60,
             secure: false,
            })

        return res.status(200).json({
            success: true,
            token,
            changePassword: false,
            security:{
                user: security._id,
                securityId: security.securityId,
                role: security.role
            },
            message: "Login Successful",
        }) 
        
    } catch (error) { 
        console.error("Security login error:", error)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

module.exports = securityLogin