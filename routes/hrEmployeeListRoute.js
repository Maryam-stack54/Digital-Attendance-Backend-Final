const express = require("express")

const router = express.Router()

const authentication = require("../middlewares/authentication.js")

const {getEmployeeList, searchEmployeeList} = require("../controllers/hrEmployeeController.js")

router.get("/employeeList", authentication, getEmployeeList)
router.get("/searchEmployeeList", authentication, searchEmployeeList)

module.exports = router