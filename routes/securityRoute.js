const express = require("express")
const router = express.Router()

const securityLogin = require("../controllers/securityLogin.js")

const changePassword = require("../controllers/changeSecurityPassword.js")

router.post("/securityLogin", securityLogin)
router.post("/changePassword", changePassword)

module.exports = router
  