const attendanceModel = require("../models/attendanceModel.js");

const getAttendance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const records = await attendanceModel
      .find()
      .populate("staff", "staffId firstName lastName")
      .sort({ timeIn: -1 })
      .skip(skip)
      .limit(limit);

    const total = await attendanceModel.countDocuments();

    const result = records
      .map((record) => {
        if (!record.staff) return null;

        const time = new Date(record.timeIn);

        const cutoff = new Date(time);
        cutoff.setHours(9, 0, 0, 0);

        const status = time <= cutoff ? "Early" : "Late";

        return {
          employeeId: record.staff.staffId,
          employeeName: `${record.staff.firstName} ${record.staff.lastName}`,
          timeIn: record.timeIn,
          status: status,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: result,
    });
  } catch (error) {
    console.log("Error fetching attendance:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch attendance",
    });
  }
};

const searchAttendance = async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const regex = new RegExp(query, "i");

    const records = await attendanceModel
      .find()
      .populate({
        path: "staff",
        match: {
          $or: [
            { staffId: regex },
            { firstName: regex },
            { lastName: regex },
          ],
        },
        select: "staffId firstName lastName",
      })
      .sort({ timeIn: -1 });

    const result = records
      .filter((record) => record.staff)
      .map((record) => {
        const time = new Date(record.timeIn);

        const cutoff = new Date(time);
        cutoff.setHours(9, 0, 0, 0);

        const status = time <= cutoff ? "Early" : "Late";

        return {
          employeeId: record.staff.staffId,
          employeeName: `${record.staff.firstName} ${record.staff.lastName}`,
          timeIn: record.timeIn,
          status: status,
        };
      });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("Error searching attendance:", error);

    return res.status(500).json({
      success: false,
      message: "Could not search attendance",
    });
  }
};

module.exports = { getAttendance, searchAttendance };