const qrCode = require("qrcode")
const staffModel = require("../models/staffModel")
const attendanceModel = require("../models/attendanceModel")
const crypto = require("crypto")

const generateQRCode = async(req, res)=>{
    try {
        // from jwt authentication middleware
        const staffId = req.user.id

        // Fetch full user info from database
       const staff = await staffModel.findById(staffId)
       .select("firstName lastName staffId department unit email")


       if (!staff) {
        return res.status(404).json({
          success: false,
          message: "Staff not found"
        });
      }
       //generate QR Timestamp
       const qrTimeStamp = new Date().toISOString()

       // generate QR data using staffId + QR timestamp
       const qrData = {
        staffId: staff.staffId,
        firstName: staff.firstName,
        lastName: staff.lastName,
        department: staff.department,
        unit: staff.unit,
        qrTimeStamp
      }

      //generate signature using secret key
      const secretKey = process.env.QR_SECRET
      const qrString = JSON.stringify(qrData)
      const signature = crypto
       .createHmac("sha256", secretKey)
       .update(qrString)
       .digest("hex")

       //embed signature in QR payload
       const qrPayload = {...qrData, signature}
       const qrPayloadString = JSON.stringify(qrPayload)


        //generate qrCode image
        const qrCodeImage = await qrCode.toDataURL(qrPayloadString)

        return res.status(200).json({
            success: true,
            message: "QRCode generated successfully",
            qrCodeImage,
            qrData: qrPayloadString,
            name: `${staff.firstName} ${staff.lastName}`,
            department: staff.department,
            email: staff.email,
            unit: staff.unit
        })

    } catch (error) {
        console.error("QR Code generation error:", error)
        res.status(500).json({
            success: false,
            message:"Unable to generate QR Code"
        })
    }
}

const scanQrCode = async(req, res)=>{
   try {
    const {qrData} = req.body
    if(!qrData)
        return res.status(400).json({message: "QR data is required"})

    let payload
    try {
        payload = JSON.parse(qrData)
    } catch (error) {
        return res.status(400).json({message: "Invalid QR Code format"})
    }
    
    const {staffId,  qrTimeStamp, signature} = payload
    if(!staffId || !qrTimeStamp ||!signature){
        return res.status(400).json({message: "QR code missing fields"})
    }

    //verify QRsignature
    const {firstName, lastName, department, unit} = payload
    const secretKey = process.env.QR_SECRET
    const qrString = JSON.stringify({staffId, firstName, lastName, department, unit, qrTimeStamp})
    const expectedSignature = crypto.createHmac("sha256", secretKey).update(qrString).digest("hex")

    if (signature !== expectedSignature){
        return res.status.json({message: "Invalid or tampered QR Code"})
    }

    //check if staff exists
    const existingStaff = await staffModel.findOne({staffId})
    if(!existingStaff){
        return res.status(404).json({message: "Invalid QRCode"})
    }

    //check if you clocked in already
    const today = new Date()
    today.setHours(0,0,0,0)
    const alreadyClockedIn = await attendanceModel.findOne({
        staff: existingStaff._id,
        timeIn: {$gte: today}
    })
    if(alreadyClockedIn){
        return res.status(400).json({message: "Already clocked in today"})
    }                                                                                                                   

    //record attendance
    const attendance = await attendanceModel.create({
        staff: existingStaff._id,
        timeIn: new Date(),
        qrTimeStamp: qrTimeStamp? new Date(qrTimeStamp) : undefined
    })

    // Populate staff info
    const populatedAttendance = await attendance.populate(
        "staff",
        "firstName lastName department unit staffId"
      );
  
      return res.status(200).json({
        message: "Attendance recorded successfully",
        attendance: populatedAttendance
      });
    
   } catch (error) {
    console.error("Scan Qr error", error)
        return res.status(500).json({message: "Failed to record attendance"})
   } 
}

module.exports = {generateQRCode, scanQrCode}  