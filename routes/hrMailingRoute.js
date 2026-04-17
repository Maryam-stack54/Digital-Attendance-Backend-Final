const express = require("express")

const router = express.Router()

const authentication = require("../middlewares/authentication.js")

const {sendMailToStaff, getAllStaff, sendMailToMultiple, sendMailToAllPersonalized} = require("../controllers/hrMailingController.js")

router.post("/mailToStaff", authentication,  sendMailToStaff)
router.post("/mailToMultipleStaffs", authentication, sendMailToMultiple)
router.post("/personalizedMail", authentication, sendMailToAllPersonalized)
router.get("/staff", authentication,  getAllStaff)

module.exports = router    