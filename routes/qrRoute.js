const express = require("express")

const router = express.Router()

const authentication = require("../middlewares/authentication")

const {generateQRCode, scanQrCode} = require("../controllers/qrController")

router.get("/qrCode", authentication, generateQRCode)

router.post("/qrScan", scanQrCode)

module.exports = router 