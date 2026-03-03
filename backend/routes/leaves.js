const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

const LEAVE_LIMITS = { Sick: 10, Casual: 12, Earned: 15, Unpaid: 999 };

// Helper: count working days between two date strings
function countWorkingDays(start, end) {
  let count = 0;
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

// Helper: get all date strings in range
function dateRange(start, end) {
  const dates = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/**
 * @swagger
 * /api/leaves/balance/{emp_id}:
 *   get:
 *     summary: Get leave balance for an employee
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: emp_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: Year (default current year)
 *     responses:
 *       200:
 *         description: Leave balance retrieved successfully
 *       401:
 *         description: Unauthorized
 */

// GET /api/leaves/balance/:emp_id
router.get('/balance/:emp_id', protect, async (req, res) => {
  try {
    const empId = req.params.emp_id;
    const year = req.query.year || new Date().getFullYear();

    const yearStart = `${year}-01-01`;
    const yearEnd   = `${year}-12-31`;

    const approved = await LeaveRequest.find({
      employee_id: empId,
      status: 'Approved',
      start_date: { $gte: yearStart, $lte: yearEnd }
    });

    const used = { Sick: 0, Casual: 0, Earned: 0, Unpaid: 0 };
    approved.forEach(lr => {
      if (used[lr.leave_type] !== undefined) used[lr.leave_type] += lr.total_days;
    });

    const balance = {};
    Object.keys(LEAVE_LIMITS).forEach(type => {
      balance[type] = {
        allowed: LEAVE_LIMITS[type] === 999 ? 'Unlimited' : LEAVE_LIMITS[type],
        used: used[type],
        remaining: LEAVE_LIMITS[type] === 999 ? 'Unlimited' : Math.max(0, LEAVE_LIMITS[type] - used[type])
      };
    });

    res.json({ success: true, data: balance, year });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


/**
 * @swagger
 * /api/leaves/apply:
 *   post:
 *     summary: Apply for leave
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - leave_type
 *               - start_date
 *               - end_date
 *               - reason
 *             properties:
 *               employee_id:
 *                 type: string
 *               leave_type:
 *                 type: string
 *                 enum: [Sick, Casual, Earned, Unpaid]
 *               start_date:
 *                 type: string
 *                 example: 2026-03-10
 *               end_date:
 *                 type: string
 *                 example: 2026-03-12
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Leave request submitted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 */

// POST /api/leaves/apply
router.post('/apply', protect, async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;

    if (!employee_id || !leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate employee & DOJ
    const emp = await Employee.findById(employee_id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    const doj = new Date(emp.joining_date).toISOString().split('T')[0];
    if (start_date < doj) {
      return res.status(400).json({
        success: false,
        message: `Cannot apply leave before your Date of Joining (${doj})`
      });
    }
    if (start_date > end_date) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date' });
    }

    const total_days = countWorkingDays(start_date, end_date);
    if (total_days === 0) {
      return res.status(400).json({ success: false, message: 'No working days in selected range (weekends excluded)' });
    }

    // Check balance (for non-unpaid)
    if (leave_type !== 'Unpaid' && LEAVE_LIMITS[leave_type]) {
      const year = start_date.split('-')[0];
      const yearStart = `${year}-01-01`;
      const approvedLeaves = await LeaveRequest.find({
        employee_id,
        leave_type,
        status: 'Approved',
        start_date: { $gte: yearStart }
      });
      const usedDays = approvedLeaves.reduce((sum, l) => sum + l.total_days, 0);
      const remaining = LEAVE_LIMITS[leave_type] - usedDays;
      if (total_days > remaining) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leave_type} leave balance. Requested: ${total_days}, Available: ${remaining}`
        });
      }
    }

    // Check overlapping leave requests
    const overlap = await LeaveRequest.findOne({
      employee_id,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { start_date: { $lte: end_date }, end_date: { $gte: start_date } }
      ]
    });
    if (overlap) {
      return res.status(400).json({
        success: false,
        message: `Overlapping leave request already exists (${overlap.start_date} to ${overlap.end_date}, Status: ${overlap.status})`
      });
    }

    const leave = await LeaveRequest.create({ employee_id, leave_type, start_date, end_date, total_days, reason });
    res.status(201).json({ success: true, data: leave, message: 'Leave request submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/leaves/{id}/approve:
 *   put:
 *     summary: Approve leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave Request ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approver_note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Leave approved successfully
 *       404:
 *         description: Leave not found
 *       400:
 *         description: Leave already processed
 *       401:
 *         description: Unauthorized
 */


// PUT /api/leaves/:id/approve
router.put('/:id/approve', protect, async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Leave is already ${leave.status}` });
    }

    leave.status = 'Approved';
    leave.approver_note = req.body.approver_note || '';
    leave.approved_by = req.employee._id;
    await leave.save();

    // Auto-create attendance records for leave days
    const dates = dateRange(leave.start_date, leave.end_date);
    for (const date of dates) {
      await Attendance.findOneAndUpdate(
        { employee_id: leave.employee_id, date },
        { employee_id: leave.employee_id, date, status: 'On Leave', note: `${leave.leave_type} Leave` },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, data: leave, message: `Leave approved. ${dates.length} attendance records updated.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/leaves/{id}/reject:
 *   put:
 *     summary: Reject leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave Request ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approver_note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Leave rejected successfully
 *       404:
 *         description: Leave not found
 *       400:
 *         description: Leave already processed
 *       401:
 *         description: Unauthorized
 */


// PUT /api/leaves/:id/reject
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Leave is already ${leave.status}` });
    }

    leave.status = 'Rejected';
    leave.approver_note = req.body.approver_note || 'Request rejected';
    leave.approved_by = req.employee._id;
    await leave.save();

    res.json({ success: true, data: leave, message: 'Leave request rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/leaves:
 *   get:
 *     summary: Get leave requests (with filters)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: Filter by year
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *     responses:
 *       200:
 *         description: Leave list retrieved successfully
 *       401:
 *         description: Unauthorized
 */


// GET /api/leaves?employee_id=...&year=...&status=...
router.get('/', protect, async (req, res) => {
  try {
    const { employee_id, year, status } = req.query;
    const query = {};
    if (employee_id) query.employee_id = employee_id;
    if (status) query.status = status;
    if (year) query.start_date = { $regex: `^${year}` };

    const leaves = await LeaveRequest.find(query)
      .populate('employee_id', 'name department')
      .populate('approved_by', 'name')
      .sort({ createdAt: -1 });

    const formatted = leaves.map(l => ({
      id: l._id,
      employee_id: l.employee_id._id || l.employee_id,
      employee_name: l.employee_id.name || '',
      department: l.employee_id.department || '',
      leave_type: l.leave_type,
      start_date: l.start_date,
      end_date: l.end_date,
      total_days: l.total_days,
      reason: l.reason,
      status: l.status,
      approver_note: l.approver_note,
      approved_by: l.approved_by?.name || '',
      created_at: l.createdAt
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
