const staffModel = require("../models/staffModel.js");
const attendanceModel = require("../models/attendanceModel.js");

/* =========================
   GET EMPLOYEE LIST (FIXED)
========================= */
const getEmployeeList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // ✅ FIXED: proper filter (no broken $ne usage)
    const staffFilter = {
      $or: [
        { firstName: { $exists: true, $ne: "" } },
        { lastName: { $exists: true, $ne: "" } }
      ]
    };

    const staffs = await staffModel
      .find(staffFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalStaffs = await staffModel.countDocuments(staffFilter);

    const result = await Promise.all(
      staffs.map(async (staff) => {
        // ✅ SAFE NAME HANDLING (fixes undefined + unnamed issue)
        const first = (staff.firstName || staff.firstname || "").trim();
        const last = (staff.lastName || staff.lastname || "").trim();

        const fullName = [first, last].filter(Boolean).join(" ");
        const name = fullName || "Unnamed Staff";

        // ✅ attendance count (valid clock-ins only)
        const presentDays = await attendanceModel.countDocuments({
          staff: staff._id,
          timeIn: { $gte: startOfMonth }
        });

        // ✅ FIXED percentage logic (real monthly scaling)
        const daysInMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        ).getDate();

        const attendancePercentage =
          daysInMonth === 0
            ? 0
            : Math.min(
                100,
                Math.round((presentDays / daysInMonth) * 100)
              );

        return {
          staffId: staff.staffId || "N/A",
          name,
          department: staff.department || "N/A",
          unit: staff.unit || "N/A",
          email: staff.email || "N/A",
          attendancePercentage
        };
      })
    );

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalStaffs,
      totalPages: Math.ceil(totalStaffs / limit),
      data: result
    });

  } catch (error) {
    console.log("Error fetching employee list:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch employee list"
    });
  }
};


/* =========================
   SEARCH EMPLOYEE LIST (FIXED)
========================= */
const searchEmployeeList = async (req, res) => {
  try {
    const rawQuery = req.query.query || "";
    const query = String(rawQuery).trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required"
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const regex = new RegExp(query, "i");

    const staffFilter = {
      $or: [
        { staffId: regex },
        { firstName: regex },
        { lastName: regex }
      ]
    };

    const staffs = await staffModel
      .find(staffFilter)
      .skip(skip)
      .limit(limit);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await Promise.all(
      staffs.map(async (staff) => {
        // ✅ SAFE NAME HANDLING
        const first = (staff.firstName || staff.firstname || "").trim();
        const last = (staff.lastName || staff.lastname || "").trim();

        const fullName = [first, last].filter(Boolean).join(" ");
        const name = fullName || "Unnamed Staff";

        const attendanceCount = await attendanceModel.countDocuments({
          staff: staff._id,
          timeIn: { $gte: startOfMonth }
        });

        const daysInMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        ).getDate();

        const attendancePercentage =
          daysInMonth === 0
            ? 0
            : Math.min(
                100,
                Math.round((attendanceCount / daysInMonth) * 100)
              );

        return {
          staffId: staff.staffId || "N/A",
          name,
          department: staff.department || "N/A",
          unit: staff.unit || "N/A",
          email: staff.email || "N/A",
          attendancePercentage
        };
      })
    );

    const total = await staffModel.countDocuments(staffFilter);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: result
    });

  } catch (error) {
    console.log("Error searching staff:", error);

    return res.status(500).json({
      success: false,
      message: "Could not search staff"
    });
  }
};

module.exports = {
  getEmployeeList,
  searchEmployeeList
};

