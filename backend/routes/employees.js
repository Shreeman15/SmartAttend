const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

// GET /api/employees
router.get('/', protect, async (req, res) => {
  try {
    const { department, is_active } = req.query;
    const query = {};
    if (department) query.department = department;
    if (is_active !== undefined) query.is_active = is_active === 'true';
    const employees = await Employee.find(query).sort({ name: 1 });
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/employees/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: emp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/employees/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const emp = await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: emp, message: 'Employee updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/employees/:id (soft delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const emp = await Employee.findByIdAndUpdate(req.params.id, { is_active: false }, { new: true });
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, message: 'Employee deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
