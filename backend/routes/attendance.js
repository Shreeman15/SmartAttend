const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendance');
const Employee = require('../models/employee');
const { protect } = require('../middleware/auth');
const { body, query, param, validationResult } = require('express-validator');

// Helper: today's date string YYYY-MM-DD
const todayStr = () => new Date().toISOString().split('T')[0];
const timeStr  = () => new Date().toTimeString().slice(0,5); // HH:MM

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management APIs
 */

/**
 * @swagger
 * 
 * /api/attendance/punch-in:
 *   post:
 *     summary: Employee punch in
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Punch in recorded
 *       400:
 *         description: Already punched in
 */


// POST /api/attendance/punch-in  (employee punches in)
router.post('/punch-in', protect, async (req, res) => {
  try {
    const empId = req.employee._id;
    const today = todayStr();

    // Check if already punched in today
    const existing = await Attendance.findOne({ employee_id: empId, date: today });
    if (existing && existing.check_in) {
      return res.status(400).json({ success: false, message: 'Already punched in today' });
    }

    const record = await Attendance.findOneAndUpdate(
      { employee_id: empId, date: today },
      { employee_id: empId, date: today, check_in: timeStr(), status: 'Present' },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: `Punch In recorded at ${record.check_in}`, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


/**
 * @swagger
 * /api/attendance/punch-out:
 *   post:
 *     summary: Employee punch out
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Punch out recorded
 *       400:
 *         description: Already punched out or no punch-in found
 */


// POST /api/attendance/punch-out  (employee punches out)
router.post('/punch-out', protect, async (req, res) => {
  try {
    const empId = req.employee._id;
    const today = todayStr();

    const record = await Attendance.findOne({ employee_id: empId, date: today });
    if (!record || !record.check_in) {
      return res.status(400).json({ success: false, message: 'No punch-in found for today. Please punch in first.' });
    }
    if (record.check_out) {
      return res.status(400).json({ success: false, message: 'Already punched out today' });
    }

    record.check_out = timeStr();
    await record.save(); // pre-save hook calculates hours & status

    res.json({ success: true, message: `Punch Out recorded at ${record.check_out}. Hours worked: ${record.hours_worked}`, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/attendance/today-status  (current employee's status today)
router.get('/today-status', protect, async (req, res) => {
  try {
    const today = todayStr();
    const record = await Attendance.findOne({ employee_id: req.employee._id, date: today });
    res.json({ success: true, data: record || null, date: today });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/attendance/my-history  (logged-in employee's attendance history)
router.get('/my-history', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { employee_id: req.employee._id };

    if (month && year) {
      const mm = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${mm}` };
    } else if (year) {
      query.date = { $regex: `^${year}` };
    }

    const records = await Attendance.find(query).sort({ date: -1 });

    // Summary
    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'Present').length,
      absent: records.filter(r => r.status === 'Absent').length,
      half_day: records.filter(r => r.status === 'Half-day').length,
      on_leave: records.filter(r => r.status === 'On Leave').length
    };

    res.json({ success: true, data: records, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/attendance  (admin: mark attendance manually)
router.post('/', protect, async (req, res) => {
  try {
    const { employee_id, date, check_in, check_out, status } = req.body;

    // Validate employee & DOJ
    const emp = await Employee.findById(employee_id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    const doj = new Date(emp.joining_date).toISOString().split('T')[0];
    if (date < doj) {
      return res.status(400).json({ success: false, message: `Cannot mark attendance before joining date (${doj})` });
    }

    const existing = await Attendance.findOne({ employee_id, date });
    if (existing) return res.status(400).json({ success: false, message: 'Attendance already marked for this date' });

    const record = await Attendance.create({ employee_id, date, check_in, check_out, status });
    res.status(201).json({ success: true, data: record, message: 'Attendance marked successfully' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Duplicate attendance entry' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/attendance?employee_id=...&month=...&year=...
router.get('/', protect, async (req, res) => {
  try {
    const { employee_id, month, year, date } = req.query;
    const query = {};

    if (employee_id) query.employee_id = employee_id;
    if (date)        query.date = date;
    if (month && year) {
      const mm = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${mm}` };
    } else if (year) {
      query.date = { $regex: `^${year}` };
    }

    const records = await Attendance.find(query)
      .populate('employee_id', 'name department designation')
      .sort({ date: -1 });

    const formatted = records.map(r => ({
      id: r._id,
      employee_id: r.employee_id._id || r.employee_id,
      employee_name: r.employee_id.name || '',
      department: r.employee_id.department || '',
      date: r.date,
      check_in: r.check_in,
      check_out: r.check_out,
      hours_worked: r.hours_worked,
      status: r.status,
      note: r.note
    }));

    const summary = {
      total: formatted.length,
      present: formatted.filter(r => r.status === 'Present').length,
      absent: formatted.filter(r => r.status === 'Absent').length,
      half_day: formatted.filter(r => r.status === 'Half-day').length,
      on_leave: formatted.filter(r => r.status === 'On Leave').length
    };

    res.json({ success: true, data: formatted, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/attendance/daily?date=YYYY-MM-DD
router.get('/daily', protect, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date required' });

    const employees = await Employee.find({ is_active: true });
    const attendanceRecords = await Attendance.find({ date });

    const result = employees.map(emp => {
      const att = attendanceRecords.find(a => String(a.employee_id) === String(emp._id));
      return {
        employee_id: emp._id,
        name: emp.name,
        department: emp.department,
        check_in: att?.check_in || null,
        check_out: att?.check_out || null,
        status: att?.status || 'Absent',
        hours_worked: att?.hours_worked || 0
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/attendance/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    Object.assign(record, req.body);
    await record.save();
    res.json({ success: true, data: record, message: 'Attendance updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
