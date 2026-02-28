const {body} = require("express-validator")
const validator = require("validator")

const registerValidator = [
    //email verification
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(email => { 
        if (!email.includes(".")) { 
          throw new Error("Email domain is invalid");
        }
        return true
      }),

     //staffId verification
     body("staffId")
     .trim()
     .notEmpty()
     .withMessage("staffId is required"), 

     //password verification
    body("password")
    .notEmpty() 
    .withMessage("Password is required")
    .custom((value)=>{
        if(!validator.isStrongPassword(value)){
            throw new Error("Password must be atleast 8 characters and include uppercase, lowercase, number and symbol")
        }
        return true

    })

    //confirm password
]

module.exports = registerValidator