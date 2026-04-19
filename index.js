const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config() 
const express = require("express")


const staffRoutes = require("./routes/staffRoutes")
const qrRoutes = require("./routes/qrRoute")
const securityRoutes = require("./routes/securityRoute")
const hrDashboardRoutes = require("./routes/hrDashboardRoute")
const hrEmployeeRoutes = require("./routes/hrEmployeeListRoute")
const hrReportRoutes = require("./routes/hrReportsRoute")
const hrAttendanceRoutes = require("./routes/hrAttendanceRoute")
const hrMailingRoutes = require("./routes/hrMailingRoute")
const hrSecurityRoutes = require("./routes/hrSecurityRoute")
const hrLoginRoutes = require("./routes/hrLoginRoute")

const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")


const app = express() 
app.set("trust proxy", 1)


const port = process.env.PORT 

console.log("ENV PORT:", process.env.PORT);

//cors connection
app.use(cors({
  origin: "https://digital-attendance-now-869u.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));   
  

app.use(express.json())
app.use(cookieParser())


app.use("/", staffRoutes)
app.use("/", qrRoutes)
app.use("/", securityRoutes)
app.use("/", hrDashboardRoutes)
app.use("/", hrEmployeeRoutes)
app.use("/", hrReportRoutes)
app.use("/", hrAttendanceRoutes)
app.use("/", hrMailingRoutes)
app.use("/", hrSecurityRoutes)
app.use("/", hrLoginRoutes)


mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("Connection successful")) 
.catch((err) => console.error("Connection error:", err))




app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});