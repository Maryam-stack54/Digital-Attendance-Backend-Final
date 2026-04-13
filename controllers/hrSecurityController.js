const bcrypt = require("bcryptjs")
const staffModel = require("../models/staffModel.js")
const attendanceModel = require("../models/attendanceModel.js")
const jwt = require("jsonwebtoken")

const createSecurity = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required"
      });
    }

    // Get last security user
    const lastSecurity = await staffModel
      .findOne({ role: "security" })
      .sort({ createdAt: -1 });

    let newNumber = 1;

    if (lastSecurity && lastSecurity.securityId) {
      const lastNumber = parseInt(lastSecurity.securityId.replace("SEC", ""));
      newNumber = lastNumber + 1;
    }

    // Generate new security ID
    const securityId = "SEC" + String(newNumber).padStart(3, "0");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create security user
    const security = await staffModel.create({
      securityId,
      password: hashedPassword,
      role: "security",
      changePassword: true
    });

    res.status(201).json({
       success: true,
      data: {
        securityId: security.securityId
      }
    });

  } catch (error) {
    console.error("Create security error:", error.message); 
    res.status(500).json({
      success: false,
      message: "Could not create security"
    });
  }
};
  const getAllSecurity = async (req, res) => {
    try {
      const security = await staffModel
        .find({ role: "security" })
        .select("securityId createdAt")
  
      res.status(200).json({
        success: true,
        count: security.length,
        data: security
      })
  
    } catch (error) {
      console.error("Fetch security error:", error)

      res.status(500).json({
        success: false,
        message: "Could not fetch security"
      })
    }
  }
  
  module.exports = {
    createSecurity,
    getAllSecurity
  }