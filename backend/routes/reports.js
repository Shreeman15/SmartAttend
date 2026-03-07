const express = require('express');
const router = express.Router();
const Employee = require('../models/employee');
const Attendance = require('../models/attendance');
const LeaveRequest = require('../models/LeaveRequest');
const { protect } = require('../middleware/auth');

// Helper: working days in a month
function workingDaysInMonth(year, month) {
  const days = new Date(year, month, 0).getDate();
  let count = 0;
  for (let d = 1; d <= days; d++) {
    const day = new Date(year, month - 1, d).getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

// GET /api/reports/salary?month=MM&year=YYYY
router.get('/salary', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ success: false, message: 'month and year required' });

    const mm = String(month).padStart(2, '0');
    const datePrefix = `${year}-${mm}`;
    const workingDays = workingDaysInMonth(Number(year), Number(month));

    const employees = await Employee.find({ is_active: true });
    const results = [];

    for (const emp of employees) {
      const doj = new Date(emp.joining_date).toISOString().split('T')[0];
      const dojPrefix = doj.slice(0, 7); // YYYY-MM

      // If employee hasn't joined yet this month, skip
      if (doj > `${year}-${mm}-31`) {
        continue;
      }

      // Attendance records for this month
      const attRecords = await Attendance.find({
        employee_id: emp._id,
        date: { $regex: `^${datePrefix}` }
      });

      let daysPresent    = 0;
      let daysHalfDay    = 0;
      let daysAbsent     = 0;
      let daysOnLeave    = 0; // approved paid leave
      let daysUnpaid     = 0;

      // Get approved leaves for this month
      const approvedLeaves = await LeaveRequest.find({
        employee_id: emp._id,
        status: 'Approved',
        $or: [
          { start_date: { $regex: `^${datePrefix}` } },
          { end_date:   { $regex: `^${datePrefix}` } }
        ]
      });
      const unpaidLeaveDays = new Set();
      approvedLeaves.forEach(l => {
        if (l.leave_type === 'Unpaid') {
          // collect unpaid dates
          const cur = new Date(l.start_date);
          const last = new Date(l.end_date);
          while (cur <= last) {
            const ds = cur.toISOString().split('T')[0];
            if (ds.startsWith(datePrefix)) unpaidLeaveDays.add(ds);
            cur.setDate(cur.getDate() + 1);
          }
        }
      });

      attRecords.forEach(r => {
        if (r.status === 'Present')  daysPresent++;
        else if (r.status === 'Half-day') daysHalfDay++;
        else if (r.status === 'Absent')   daysAbsent++;
        else if (r.status === 'On Leave') {
          if (unpaidLeaveDays.has(r.date)) daysUnpaid++;
          else daysOnLeave++;
        }
      });

      // Effective working days (handle new joinee partial month)
      let effectiveWorkingDays = workingDays;
      if (dojPrefix === `${year}-${mm}`) {
        // count working days from doj to end of month
        const lastDay = new Date(year, month, 0).toISOString().split('T')[0];
        let cnt = 0;
        const cur = new Date(doj);
        const last = new Date(lastDay);
        while (cur <= last) {
          const d = cur.getDay();
          if (d !== 0 && d !== 6) cnt++;
          cur.setDate(cur.getDate() + 1);
        }
        effectiveWorkingDays = cnt;
      }

      const perDaySalary  = emp.base_salary / effectiveWorkingDays;
      const halfDayPenalty = daysHalfDay * perDaySalary * 0.5;
      const absentPenalty  = daysAbsent * perDaySalary;
      const unpaidPenalty  = daysUnpaid * perDaySalary;
      const totalDeductions = halfDayPenalty + absentPenalty + unpaidPenalty;
      const grossSalary   = emp.base_salary;
      const netSalary     = Math.max(0, grossSalary - totalDeductions);

      results.push({
        employee_id:          emp._id,
        name:                 emp.name,
        department:           emp.department,
        designation:          emp.designation,
        base_salary:          emp.base_salary,
        working_days:         effectiveWorkingDays,
        days_present:         daysPresent,
        days_half_day:        daysHalfDay,
        days_absent:          daysAbsent,
        days_on_leave:        daysOnLeave,
        days_unpaid_leave:    daysUnpaid,
        half_day_deduction:   parseFloat(halfDayPenalty.toFixed(2)),
        absent_deduction:     parseFloat(absentPenalty.toFixed(2)),
        unpaid_deduction:     parseFloat(unpaidPenalty.toFixed(2)),
        total_deductions:     parseFloat(totalDeductions.toFixed(2)),
        gross_salary:         parseFloat(grossSalary.toFixed(2)),
        net_salary:           parseFloat(netSalary.toFixed(2))
      });
    }

    res.json({ success: true, data: results, month, year, working_days_in_month: workingDays });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reports/attendance?month=MM&year=YYYY
router.get('/attendance', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ success: false, message: 'month and year required' });

    const mm = String(month).padStart(2, '0');
    const datePrefix = `${year}-${mm}`;

    const records = await Attendance.find({ date: { $regex: `^${datePrefix}` } })
      .populate('employee_id', 'name department');

    const deptSummary = {};
    records.forEach(r => {
      const dept = r.employee_id?.department || 'Unknown';
      if (!deptSummary[dept]) deptSummary[dept] = { present: 0, absent: 0, half_day: 0, on_leave: 0, total: 0 };
      deptSummary[dept].total++;
      if (r.status === 'Present')  deptSummary[dept].present++;
      if (r.status === 'Absent')   deptSummary[dept].absent++;
      if (r.status === 'Half-day') deptSummary[dept].half_day++;
      if (r.status === 'On Leave') deptSummary[dept].on_leave++;
    });

    res.json({ success: true, data: deptSummary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reports/leaves?year=YYYY
router.get('/leaves', protect, async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const leaves = await LeaveRequest.find({ start_date: { $regex: `^${year}` } })
      .populate('employee_id', 'name department');

    const empSummary = {};
    leaves.forEach(l => {
      const empId = String(l.employee_id._id);
      if (!empSummary[empId]) {
        empSummary[empId] = {
          name: l.employee_id.name,
          department: l.employee_id.department,
          Sick: 0, Casual: 0, Earned: 0, Unpaid: 0, total: 0
        };
      }
      if (l.status === 'Approved') {
        empSummary[empId][l.leave_type] = (empSummary[empId][l.leave_type] || 0) + l.total_days;
        empSummary[empId].total += l.total_days;
      }
    });

    res.json({ success: true, data: Object.values(empSummary) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
