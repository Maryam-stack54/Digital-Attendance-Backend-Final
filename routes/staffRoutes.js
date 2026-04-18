const express = require("express")
const router = express.Router()

const registerValidator = require("../middlewares/registerValidate.js")
const loginValidator = require("../middlewares/loginValidate.js")
const {register, login} = require("../controllers/staffController.js")
const forgotPassword = require("../controllers/forgotPassword.js")
const resetPassword = require("../controllers/resetPassword.js")
const googleLogin = require("../controllers/googleAuth.js")




router.post("/registerStaff", registerValidator, register)

router.post("/loginStaff", loginValidator, login)

router.post("/forgotPassword", forgotPassword)

router.put("/resetPassword/:token", resetPassword)

router.post("/googleLogin", googleLogin)

router.get("/test-cookie", (req, res) => {
  res.json({
    cookies: req.cookies || {},
    headerCookie: req.headers.cookie || null,
    message: "cookie test working"
  });
});

module.exports = router