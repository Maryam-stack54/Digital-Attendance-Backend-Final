const staffModel = require("../models/staffModel.js");
const attendanceModel = require("../models/attendanceModel.js");

// ===================== WEEKLY REPORT =====================
const getWeeklyReport = async (req, res) => {
  try {
    const staffList = await staffModel.find();

    const today = new Date();

    // Get Monday of current week
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 4);
    endOfWeek.setHours(23, 59, 59, 999);

    const attendance = await attendanceModel.find({
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const report = staffList.map((staff) => {
      const staffAttendance = attendance.filter(
        (a) => a.staffId.toString() === staff._id.toString()
      );

      let dayMap = {
        Mon: "A",
        Tue: "A",
        Wed: "A",
        Thu: "A",
        Fri: "A",
      };

      staffAttendance.forEach((a) => {
        const d = new Date(a.date).getDay();

        const indexMap = {
          1: "Mon",
          2: "Tue",
          3: "Wed",
          4: "Thu",
          5: "Fri",
        };

        const dayKey = indexMap[d];

        if (dayKey) {
          dayMap[dayKey] = a.status === "present" ? "P" : "A";
        }
      });

      const presentCount = Object.values(dayMap).filter((v) => v === "P").length;
      const rate = Math.round((presentCount / 5) * 100);

      return {
        staffId: staff._id,

        // ✅ FIXED NAME HERE
        name: `${staff.firstName} ${staff.lastName}`,

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
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const attendance = await attendanceModel.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalDays = endOfMonth.getDate();

    const report = staffList.map((staff) => {
      const staffAttendance = attendance.filter(
        (a) => a.staffId.toString() === staff._id.toString()
      );

      const presentDays = staffAttendance.filter(
        (a) => a.status === "present"
      ).length;

      const absentDays = totalDays - presentDays;

      const rate = Math.round((presentDays / totalDays) * 100);

      return {
        staffId: staff._id,

        // ✅ FIXED NAME HERE
        name: `${staff.firstName} ${staff.lastName}`,

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