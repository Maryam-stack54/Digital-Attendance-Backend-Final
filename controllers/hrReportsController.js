const staffModel = require("../models/staffModel.js");
const attendanceModel = require("../models/attendanceModel.js");

// ===================== WEEKLY REPORT =====================
const getWeeklyReport = async (req, res) => {
  try {
    const staffList = await staffModel.find();

    const today = new Date();

    // ✅ Start of week (Monday)
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // ✅ End of week (Friday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 4);
    endOfWeek.setHours(23, 59, 59, 999);

    // ✅ FIXED: use timeIn instead of date
    const attendance = await attendanceModel.find({
      timeIn: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const report = staffList.map((staff) => {
      // ✅ FIXED: use correct field (staff, not staffId)
      const staffAttendance = attendance.filter(
        (a) => a.staff.toString() === staff._id.toString()
      );

      let dayMap = {
        Mon: "A",
        Tue: "A",
        Wed: "A",
        Thu: "A",
        Fri: "A",
      };

      staffAttendance.forEach((a) => {
        // ✅ FIXED: use timeIn instead of date
        const d = new Date(a.timeIn).getDay();

        const indexMap = {
          1: "Mon",
          2: "Tue",
          3: "Wed",
          4: "Thu",
          5: "Fri",
        };

        const dayKey = indexMap[d];

        if (dayKey) {
          // ✅ FIXED: no status field → if record exists = Present
          dayMap[dayKey] = "P";
        }
      });

      const presentCount = Object.values(dayMap).filter((v) => v === "P").length;
      const rate = Math.round((presentCount / 5) * 100);

      // ✅ SAFE NAME FIX
      const first = (staff.firstName || "").trim();
      const last = (staff.lastName || "").trim();
      const name = [first, last].filter(Boolean).join(" ") || "Unnamed Staff";

      return {
        staffId: staff._id,
        name,
        Mon: dayMap.Mon,
        Tue: dayMap.Tue,
        Wed: dayMap.Wed,
        Thu: dayMap.Thu,
        Fri: dayMap.Fri,
        rate,
      };
    });

    res.json({ data: report });

  } catch (err) {
    console.log("Weekly Report Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== MONTHLY REPORT =====================
const getMonthlyReport = async (req, res) => {
  try {
    const staffList = await staffModel.find();

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // ✅ FIXED: use timeIn
    const attendance = await attendanceModel.find({
      timeIn: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const getWorkingDays = (start, end) => {
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++; // skip Sunday(0) & Saturday(6)
    current.setDate(current.getDate() + 1);
  }

  return count;
};

const totalDays = getWorkingDays(startOfMonth, endOfMonth);

    const report = staffList.map((staff) => {

      // ✅ FIXED: correct staff reference
      const staffAttendance = attendance.filter(
        (a) => a.staff.toString() === staff._id.toString()
      );

      // ✅ FIXED: if record exists → present
      const uniqueDays = new Set(
  staffAttendance.map(a =>
    new Date(a.timeIn).toDateString()
  )
);

      const presentDays = uniqueDays.size;

      const absentDays = totalDays - presentDays;

      const rate =
        totalDays === 0
          ? 0
          : Math.round((presentDays / totalDays) * 100);

      // ✅ SAFE NAME FIX
      const first = (staff.firstName || "").trim();
      const last = (staff.lastName || "").trim();
      const name = [first, last].filter(Boolean).join(" ") || "Unnamed Staff";

      return {
        staffId: staff._id,
        name,
        daysPresent: presentDays,
        daysAbsent: absentDays,
        rate,
      };
    });

    res.json({ data: report });

  } catch (err) {
    console.log("Monthly Report Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getWeeklyReport, getMonthlyReport };