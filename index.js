const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config()
const express = require("express")
const staffRoutes = require("./routes/staffRoutes")
const qrRoutes = require("./routes/qrRoute")
const securityRoutes = require("./routes/securityRoute")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")


const app = express() 
const port = process.env.PORT || 5000

//cors connection
app.use(cors({
  origin: "http://localhost:5173",
    credentials: true
  }));   
  

app.use(express.json())
app.use(cookieParser())


app.use("/", staffRoutes)
app.use("/", qrRoutes)
app.use("/", securityRoutes)



mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("Connection successful")) 
.catch((err) => console.error("Connection error:", err))



app.listen(port, ()=>{
    console.log("server is running in port 5000")
})

