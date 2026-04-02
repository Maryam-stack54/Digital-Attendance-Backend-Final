const bcrypt = require("bcryptjs");
const staffModel = require("../models/staffModel");

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // 1. Validate input
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // 2. Find user with valid token + unexpired token
    const staff = await staffModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!staff) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    staff.password = hashedPassword;

    // 4. Clear reset token fields
    staff.resetPasswordToken = undefined;
    staff.resetPasswordExpires = undefined;

    // 5. Save updated user
    await staff.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = resetPassword;