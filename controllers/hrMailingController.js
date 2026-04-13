const staffModel = require("../models/staffModel");
const { sendEmail } = require("../utils/mailer");

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

const sendMailToMultiple = async (req, res) => {
  try {
    const { staffIds, subject, message } = req.body;

    if (
      !Array.isArray(staffIds) ||
      staffIds.length === 0 ||
      !subject ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "staffIds, subject and message required",
      });
    }

    const staffs = await staffModel.find({
      staffId: { $in: staffIds },
    });

    if (!staffs.length) {
      return res.status(404).json({
        success: false,
        message: "No staff found",
      });
    }

    await Promise.all(
      staffs.map((staff) => {
        const html = `
          <div style="font-family: Arial;">
            <h3>Hello ${staff.firstName}</h3>
            <p>${message}</p>
            <br/>
            <strong>HR Department</strong>
          </div>
        `;

        return sendEmail({
          to: staff.email,
          subject,
          html,
        });
      })
    );

    return res.status(200).json({
      success: true,
      message: `Sent to ${staffs.length} staff`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Bulk mail failed",
    });
  }
};

const sendMailToAllPersonalized = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required",
      });
    }

    //  GET ALL STAFF
    const staffs = await staffModel.find();

    if (!staffs.length) {
      return res.status(404).json({
        success: false,
        message: "No staff found",
      });
    }

    // SEND PERSONALIZED EMAILS
    await Promise.all(
      staffs.map((staff) => {
        // 🧠 PERSONALIZATION
        const personalizedMessage = `
          <div style="font-family: Arial; line-height: 1.6;">
            <h3>Hello ${staff.firstName || "Staff"},</h3>
            <p>${message}</p>
            <br/>
            <p>Regards,</p>
            <strong>HR Department</strong>
          </div>
        `;

        return sendEmail({
          to: staff.email,
          subject,
          html: personalizedMessage,
        });
      })
    );

    return res.status(200).json({
      success: true,
      message: `Emails sent to ${staffs.length} staff`,
    });
  } catch (error) {
    console.error("Bulk personalized error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send personalized emails",
    });
  }
};

module.exports = {
  getAllStaff,
  sendMailToStaff,
  sendMailToMultiple,
  sendMailToAllPersonalized
};