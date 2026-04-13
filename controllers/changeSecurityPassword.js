const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const staffModel = require("../models/staffModel.js")

const changeSecurityPassword = async (req, res) => {
  try {
    const { securityId, temporaryPassword, newPassword } = req.body;

    if (!securityId || !temporaryPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // find user
    const security = await staffModel.findOne({
      securityId,
      role: "security"
    });

    if (!security) {
      return res.status(404).json({
        success: false,
        message: "Security not found"
      });
    }

    // ❗ FIRST check: already changed password?
    if (!security.changePassword) {
      return res.status(403).json({
        success: false,
        message: "Password already changed. Please login normally."
      });
    }

    // verify temporary password
    const isMatch = await bcrypt.compare(
      temporaryPassword,
      security.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid temporary password"
      });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update
    security.password = hashedPassword;
    security.changePassword = false;

    await security.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


module.exports = changeSecurityPassword