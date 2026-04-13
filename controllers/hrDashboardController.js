
const bcrypt = require("bcryptjs")
const staffModel = require("../models/staffModel.js")
const attendanceModel = require("../models/attendanceModel.js")
const jwt = require("jsonwebtoken")



const getAllStaffs = async(req, res)=>{
    try {
        const staff = await staffModel
        .find({role: "staff"})
        .select("firstName lastName email staffId unit department role createdAt")
        .sort({createdAt: -1})

        return res.status(200).json({
            success: true,
            count: staff.length,
            staff
        })
    } catch (error) {
        console.error("Get all staff error", error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch staff"
        })
      
      }
}


const getDailyReports = async(req, res)=>{
    try {
        //Get today's start time
        const today = new Date()
        today.setHours(0,0,0,0)

        //Set tomorrow's date
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)

        //find attendance for today only
        const attendance = await attendanceModel
        .find({
            timeIn: {
                $gte: today,
                $lt: tomorrow
            }
        })  .populate("staff", "firstName lastName staffId department unit")
        .sort({timeIn: -1})

        res.status(200).json({
            success: true,
            count: attendance.length,
            attendance
        })
    } catch (error) {
        console.error("Daily report error", error)
        return res.status(500).json({
            success: false,
            message: "Failed to fetch daily reports"
        })
        
    }

}

const getEarlyArrivals = async(req, res)=>{
  try {

    //Get today's start time
    const today = new Date()
    today.setHours(0,0,0,0)

    //Set tomorrow's date
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)


    //9am cutoff
    const cutoff = new Date()
    cutoff.setHours(9,0,0,0)
    
    const earlyArrivals = await attendanceModel
    .find({
       timeIn: {
          $gte: today,
          $lt: cutoff
      }
  }).populate("staff")

  return res.status(200).json({
    success: true,
    count: earlyArrivals.length,
    data: earlyArrivals

  })

  } catch (error) {

    console.log("Error fetching early arrivals:", error)

    return res.status(500).json({
      success: false,
      message: "Could not fetch early arrivals"
    })
  }
}

const getAbsentToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1. Get all employees
    const allStaffs = await staffModel.find();

    // 2. Get today's attendance records
    const presentRecords = await attendanceModel.find({
      timeIn: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // 3. Extract present employee IDs
    const presentIds = new Set(
      presentRecords.map((r) => r.staff?.staffId?.toString())
    );

    // 4. Filter absent employees
    const absentEmployees = allStaffs.filter(
      (emp) => !presentIds.has(emp.staffId?.toString())
    );

    return res.status(200).json({
      success: true,
      count: absentEmployees.length,
      data: absentEmployees
    });

  } catch (error) {
    console.log("Absent today error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch absent employees"
    });
  }
};

const getLateArrivals = async(req, res)=>{
  try {
    //Get today's start time
    const today = new Date()
    today.setHours(0,0,0,0)

     //Set tomorrow's date
     const tomorrow = new Date(today)
     tomorrow.setDate(today.getDate() + 1)
 
 
     //9am cutoff
     const cutoff = new Date()
     cutoff.setHours(9,0,0,0)
     
     const lateArrivals = await attendanceModel
     .find({
        timeIn: {
           $gte: cutoff,
           $lt: tomorrow
       }
   }).populate("staff", "firstName lastName staffId department")
 
   return res.status(200).json({
     success: true,
     count: lateArrivals.length,
     data: lateArrivals
 
   })
 
   } catch (error) {
 
     console.log("Error fetching late arrivals:", error)
 
     return res.status(500).json({
       success: false,
       message: "Could not fetch late arrivals"
     })
}
}

const getWeeklyAttendance = async (req, res) => {
  try {
    const today = new Date();

    // ✅ FIX: Get correct start of week (Monday)
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay(); // 0 = Sun, 1 = Mon
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    // ✅ FIX: Correct function call
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const records = await attendanceModel.find({
      timeIn: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    });

    // ✅ FIX: Correct day keys (VERY IMPORTANT)
    const stats = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0
    };

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    records.forEach((record) => {
      const dayIndex = new Date(record.timeIn).getDay();
      const dayName = days[dayIndex];

      if (stats[dayName] !== undefined) {
        stats[dayName]++;
      }
    });

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.log("Weekly attendance error", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch weekly attendance"
    });
  }
};

const getAttendanceRate = async(req, res)=>{
  try {
     //Get today's start time
     const today = new Date()
     today.setHours(0,0,0,0)

      //Get today's start time
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const totalStaffs = await staffModel.countDocuments()

    const presentToday = await attendanceModel.countDocuments({
      timeIn:{
        $gte: today,
        $lt: tomorrow
      }
    })
    const attendanceRate = ((presentToday/ totalStaffs * 100)).toFixed(0)
     return res.status(200).json({
      success: true,
      attendanceRate

     })

  } catch (error) {
    console.log("Error calculating attendance rate:", error)
    return res.status(500).json({
      success: false,
      message: "Could not calculate the attendance rate"
    })
    
  }
}

const getRecentClockIns = async (req, res) => {
  try {
    const records = await attendanceModel
      .find()
      .sort({ timeIn: -1 })
      .limit(10)
      .populate("staff", "firstName lastName staffId");

    const result = records
      .map((record) => {
        if (!record.staff || !record.timeIn) return null;

        const timeInDate = new Date(record.timeIn);

        const cutoff = new Date(timeInDate);
        cutoff.setHours(9, 0, 0, 0);

        const status =
          timeInDate.getTime() <= cutoff.getTime() ? "Early" : "Late";

        return {
          record: record.staff?.staffId || "N/A",
          name: `${record.staff?.firstName || ""} ${record.staff?.lastName || ""}`,
          timeIn: record.timeIn,
          status
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.log("Error fetching recent clock ins:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch recent clock ins"
    });
  }
};
const searchStaffs = async(req, res)=>{
  try {
    const rawQuery = req.query.query || ""
    const query = String(rawQuery)

    if(!query){
      return res.status(400).json({
        success: false,
        message: "Query is required"
      })
    }

    // Create a case-insensitive regex for partial matching
    const regex = new RegExp(query, "i") // "i" = ignore case

    // Search in staffId OR firstName OR lastName
    const staff = await staffModel.find({
      $or: [
        { staffId: regex },
        { firstName: regex },
        { lastName: regex }
      ]
    }).select("staffId firstName lastName department unit") 

    return res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    })


  } catch (error) {
    console.log("Error searching staff:", error)

    return res.status(500).json({
      success: false,
      message: "Could not search staff"
    })
  }
}

module.exports = {
  getAllStaffs,
  getDailyReports,
  getEarlyArrivals,
  getLateArrivals,
  getAttendanceRate,
  getWeeklyAttendance,
  getRecentClockIns,
  searchStaffs,
  getAbsentToday
  
  }

