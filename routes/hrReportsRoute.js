const express = require("express")

const router = express.Router()

const authentication = require("../middlewares/authentication.js")


const {getWeeklyReport, getMonthlyReport} = require("../controllers/hrReportsController.js")

router.get("/weeklyReport", authentication, getWeeklyReport)
router.get("/monthlyReport", authentication, getMonthlyReport)

module.exports = router