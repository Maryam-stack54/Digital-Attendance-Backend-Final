const express = require("express")

const router = express.Router()

const authentication = require("../middlewares/authentication.js")


const {getAttendance,  searchAttendance} = require("../controllers/hrAttendanceController.js")

router.get("/getAttendance", authentication, getAttendance)
router.get("/searchAttendance", authentication, searchAttendance)

module.exports = router 