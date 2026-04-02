const express = require("express")

const router = express.Router()

const authentication = require("../middlewares/authentication.js")


const {hrLogin } = require("../controllers/hrLogin.js")

router.post("/hrLogin",  hrLogin)

module.exports = router