const express = require("express")

const router = express.Router()

const authentication = require("../middlewares/authentication.js")

const {sendMailToStaff, getAllStaff} = require("../controllers/hrMailingController.js")

router.post("/mailToStaff", authentication,  sendMailToStaff)
router.get("/staff", authentication,  getAllStaff)

module.exports = router 