const express = require("express")

const router = express.Router()

const authentication = require("../middlewares/authentication.js")


const {createSecurity, getAllSecurity } = require("../controllers/hrSecurityController.js")

router.post("/createSecurity", authentication,  createSecurity)
router.get("/getAllSecurity", authentication, getAllSecurity)

module.exports = router 