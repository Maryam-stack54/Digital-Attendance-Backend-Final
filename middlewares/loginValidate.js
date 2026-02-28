const {body} = require("express-validator")
const validator = require("validator")

const loginValidator = [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

    body("password")
    .notEmpty()
    .withMessage("Email is required")
]
 
module.exports = loginValidator