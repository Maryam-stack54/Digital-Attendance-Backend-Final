const express = require("express")

const router = express.Router()

const authentication = require("../middlewares/authentication.js")

const {
     getAllStaffs,
     getDailyReports, 
     getEarlyArrivals, 
     getLateArrivals, 
     getAttendanceRate,
     getWeeklyAttendance,
     getRecentClockIns, 
     searchStaffs,
     getAbsentToday
    } = require("../controllers/hrDashboardController.js")

router.get("/allStaffs", authentication, getAllStaffs)
router.get("/dailyReports", authentication, getDailyReports)
router.get("/earlyArrivals", authentication, getEarlyArrivals)
router.get("/lateArrivals", authentication, getLateArrivals)
router.get("/attendanceRate", authentication, getAttendanceRate)
router.get("/weeklyAttendance",authentication, getWeeklyAttendance)
router.get("/recentClockIns", authentication, authentication, getRecentClockIns)
router.get("/absentToday", authentication,  getAbsentToday)
router.get("/searchStaffs", authentication, searchStaffs)




module.exports = router