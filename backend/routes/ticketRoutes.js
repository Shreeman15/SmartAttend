const express = require('express');

const router = express.Router();
const Ticket = require('../models/Ticket');
const { protect, adminOnly } = require('../middleware/auth');

const validStatuses = Ticket.schema.path('status').enumValues;
const validTypes = Ticket.schema.path('type').enumValues;

function isAdminRole(role) {
  return role === 'admin' || role === 'manager';
}

function parseIssueDate(value) {
  const issueDate = new Date(value);
  return Number.isNaN(issueDate.getTime()) ? null : issueDate;
}

router.post('/', protect, async (req, res) => {
  try {
    const { type, date, description } = req.body;
    const cleanDescription = String(description || '').trim();
    const issueDate = parseIssueDate(date);

    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ message: 'Please choose a valid issue type.' });
    }

    if (!issueDate) {
      return res.status(400).json({ message: 'Please provide a valid issue date.' });
    }

    if (!cleanDescription) {
      return res.status(400).json({ message: 'Please add a short description of the issue.' });
    }

    const ticket = await Ticket.create({
      employeeId: req.employee._id,
      employeeName: req.employee.name,
      type,
      date: issueDate,
      description: cleanDescription,
    });

    res.status(201).json({ message: 'Ticket raised successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({
      employeeId: req.employee._id,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, employee_id, include_deleted } = req.query;
    const filter = include_deleted === 'true' ? {} : { isDeleted: { $ne: true } };

    if (status) filter.status = status;
    if (employee_id) filter.employeeId = employee_id;

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    const updateData = {};

    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid ticket status.' });
      }
      updateData.status = status;
      updateData.resolvedAt = status === 'Resolved' ? new Date() : null;
    }

    if (adminComment !== undefined) {
      updateData.adminComment = String(adminComment || '').trim();
    }

    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      updateData,
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ message: 'Ticket updated successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const isOwner = String(ticket.employeeId) === String(req.employee._id);
    if (!isOwner && !isAdminRole(req.employee.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const isOwner = String(ticket.employeeId) === String(req.employee._id);
    const isAdmin = isAdminRole(req.employee.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'Access denied. You can only archive your own ticket.',
      });
    }

    ticket.isDeleted = true;
    ticket.deletedAt = new Date();
    ticket.deletedByRole = req.employee.role;
    await ticket.save();

    res.json({ message: 'Ticket archived successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
