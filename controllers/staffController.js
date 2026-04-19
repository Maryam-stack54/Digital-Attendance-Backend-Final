const bcrypt = require("bcryptjs")
const {validationResult} = require("express-validator")
const staffModel = require("../models/staffModel")
const jwt = require("jsonwebtoken")



const register = async(req, res)=>{
    //check validation errors from express-validator
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            })
        }
        //extract only allowed fields from model
        const {firstName, lastName, email, password, staffId, department, unit} = req.body
        //check if email or staffId already exists
        const existingStaff = await staffModel.findOne({
          $or: [{email}, {staffId}] 
        })
        if(existingStaff){
            return res.status(409).json({
                success: false,
                message: "Staff with this email or staffId already exists"
            })
        }
        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        // create staff
        const staff = await staffModel.create({
            email,
            firstName,
            lastName,
            department,
            unit,
            staffId,
            password: hashedPassword,
            role: "staff"
        
        })
        return res.status(201).json({
            success: true,
            message: "Staff registered successfully"
        })

    
    } catch (error) {
        console.log("Register error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

    
}


const login = async (req, res)=>{
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(404).json({
                success: false,
                errors: errors.array()

            })
        }
       //extract email and password
       const {email, password} = req.body
       //get the staff from the database
       const staff = await staffModel.findOne({email})
       if(!staff){
        return res.status(400).json({
            success: false,
            message: "This staff does not exist, kindly register"
            
        })
       }
       //compare password
       const isValid = bcrypt.compareSync(password, staff.password )
       if(!isValid){
            return res.status(404).json({
                success: false,
                message: "Incorrect Password"
            })
       }
        //create a token 
        const token = jwt.sign(
          {id: staff._id, role:"staff"},  
          process.env.JWT_SECRET,
          {expiresIn: "1h"}  
        )

        /*res.
           cookie("token", token,{
           maxAge: 1000* 60* 60,
           secure: process.env.NODE_ENV === "production",
           httpOnly: true,
           sameSite: process.env.NODE_ENV === "production" ? "none": "lax"
      })*/

           res.cookie("token", token, {
           maxAge: 1000 * 60 * 60,
           httpOnly: true,
           secure: true,
           sameSite: "none"
});
        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token
        }) 
    } catch (error) {
        console.log("Login error:", error)
        return res.status(500).json({
            success: false,
            message: "Login unsuccessful",
        })
        
    }
}


module.exports = {register, login}