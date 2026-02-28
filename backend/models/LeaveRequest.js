const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employee_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leave_type:    { type: String, enum: ['Sick','Casual','Earned','Unpaid'], required: true },
  start_date:    { type: String, required: true }, // YYYY-MM-DD
  end_date:      { type: String, required: true }, // YYYY-MM-DD
  total_days:    { type: Number, required: true },
  reason:        { type: String, required: true },
  status:        { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
  approver_note: { type: String, default: '' },
  approved_by:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null }
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
