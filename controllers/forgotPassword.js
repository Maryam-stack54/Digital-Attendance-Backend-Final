const crypto = require("crypto");
const staffModel = require("../models/staffModel.js");
const {sendResetEmail} = require("../utils/mailer.js");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const staff = await staffModel.findOne({ email });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "No account with this email",
      });
    }

    // 1. generate token
    const token = crypto.randomBytes(32).toString("hex");

    // 2. save token + expiry (IMPORTANT FIX)
    staff.resetPasswordToken = token;
    staff.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await staff.save(); 

    console.log("TOKEN SAVED:", token);

    // 3. reset link
    const resetLink = `http://localhost:5173/resetPassword/${token}`;

    // 4. send email
    await sendResetEmail(staff.email, resetLink);

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = forgotPassword;