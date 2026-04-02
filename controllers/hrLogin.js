const bcrypt = require("bcryptjs")
const staffModel = require("../models/staffModel.js")
const attendanceModel = require("../models/attendanceModel.js")
const jwt = require("jsonwebtoken")



const hrLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find HR user by email AND role
      const hr = await staffModel.findOne({ email: email, role: "hr" });
      if (!hr) {
        return res.status(404).json({ success: false, message: "HR not found" });
      }
  
      const isValid = await bcrypt.compare(password, hr.password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: "Incorrect password" });
      }
  
      const token = jwt.sign(
        { id: hr._id, role: "hr" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      res.cookie("token", token, {
        maxAge: 1000 * 60 * 60,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      });
  
      return res.status(200).json({ success: true, message: "HR login successful" });
  
    } catch (error) {
      console.error("HR login error:", error);
      return res.status(500).json({ success: false, message: "Login unsuccessful" });
    }
  };

  module.exports = {hrLogin}