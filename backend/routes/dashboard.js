const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.slice(0, 7);

    const [total_employees, present_today, on_leave_today, pending_approvals] = await Promise.all([
      Employee.countDocuments({ is_active: true }),
      Attendance.countDocuments({ date: today, status: 'Present' }),
      Attendance.countDocuments({ date: today, status: 'On Leave' }),
      LeaveRequest.countDocuments({ status: 'Pending' })
    ]);

    // Monthly trend (last 6 months)
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const prefix = d.toISOString().slice(0, 7);
      const present = await Attendance.countDocuments({ date: { $regex: `^${prefix}` }, status: 'Present' });
      const absent  = await Attendance.countDocuments({ date: { $regex: `^${prefix}` }, status: 'Absent' });
      trend.push({
        month: prefix,
        present,
        absent,
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' })
      });
    }

    res.json({ success: true, data: { total_employees, present_today, on_leave_today, pending_approvals, trend } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
