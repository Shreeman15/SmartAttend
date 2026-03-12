import Attendance from "../models/attendance.js";

/**
 * Convert current time to IST
 */
const getISTTime = () => {
  return new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
};



// data
const getISTDate = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });
};
/**
 * @desc   Mark attendance
 * @route  POST /api/attendance
 * @access Employee
 */
export const markAttendance = async (req, res) => {
  try {
    const { status } = req.body;

    // Current IST time
    const time = getISTTime();
    const date = getISTDate();
    
    const attendance = await Attendance.create({
      employee_id: req.user.id,
      date: date,
      check_in: time,
      check_out: null,
      status: status || "Present",
    });
    res.status(201).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Attendance already marked for this day",
      });
    }

    res.status(400).json({ message: error.message });
  }
};


/**
 * @desc   Get employee monthly attendance
 * @route  GET /api/attendance?employee_id=&month=&year=
 * @access Admin
 */
export const getAttendanceByEmployee = async (req, res) => {
  try {
    const { employee_id, month, year } = req.query;

    if (!employee_id) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: "Invalid month" });
    }

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ message: "Invalid year" });
    }

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);

    const records = await Attendance.find({
      employee_id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * @desc   Get daily attendance for all employees
 * @route  GET /api/attendance/daily?date=
 * @access Admin
 */
export const getDailyAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59);

    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const attendance = await Attendance.find({
      date: { $gte: start, $lte: end },
    }).populate("employee_id", "name department");

    res.json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * @desc   Update attendance
 * @route  PUT /api/attendance/:id
 * @access Admin
 */
export const updateAttendance = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Convert check_out to IST if updating
    if (updateData.check_out) {
      updateData.check_out = getISTTime();
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};