const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        required: true
        },
    timeIn: {
        type: Date,
        default: Date.now()
    }, 

    qrTimeStamp: {
        type: Date
    }
})

const attendanceModel= mongoose.model("Attendance", attendanceSchema)

module.exports = attendanceModel