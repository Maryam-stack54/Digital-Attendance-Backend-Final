const staffModel = require("../models/staffModel");
const { sendEmail } = require("../utils/mailer");

// ==============================
// 📥 GET ALL STAFF (FOR SEARCH)
// ==============================
const getAllStaff = async (req, res) => {
  try {
    const staff = await staffModel.find();

    const formatted = staff.map((s) => ({
      id: s.staffId,
      name: `${s.firstName} ${s.lastName || ""}`.trim(),
      email: s.email,
    }));

    return res.status(200).json({
      success: true,
      staff: formatted,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
    });
  }
};

// ==============================
// 📩 SEND MAIL
// ==============================
const sendMailToStaff = async (req, res) => {
  try {
    const { staffId, subject, message } = req.body;

    if (!staffId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const staff = await staffModel.findOne({ staffId });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    const html = `
      <div style="font-family: Arial;">
        <h3>Hello ${staff.firstName}</h3>
        <p>${message}</p>
        <br/>
        <strong>HR Department</strong>
      </div>
    `;

    await sendEmail({
      to: staff.email,
      subject,
      html,
    });

    return res.status(200).json({
      success: true,
      message: "Mail sent successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getAllStaff,
  sendMailToStaff,
};