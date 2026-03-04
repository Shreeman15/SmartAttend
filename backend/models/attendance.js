const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date:         { type: String, required: true }, // YYYY-MM-DD format
  check_in:     { type: String, default: null },  // HH:MM
  check_out:    { type: String, default: null },  // HH:MM
  hours_worked: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Present','Absent','Half-day','On Leave','Weekend','Holiday'],
    required: true
  },
  note:         { type: String, default: '' }
}, { timestamps: true });

// Unique: one record per employee per day
attendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

// Calculate hours worked before save
attendanceSchema.pre('save', function(next) {
  if (this.check_in && this.check_out) {
    const [inH, inM]   = this.check_in.split(':').map(Number);
    const [outH, outM] = this.check_out.split(':').map(Number);
    const totalMins = (outH * 60 + outM) - (inH * 60 + inM);
    this.hours_worked = Math.max(0, parseFloat((totalMins / 60).toFixed(2)));

    // Auto status based on hours
    if (this.status !== 'On Leave') {
      if (this.hours_worked >= 6) this.status = 'Present';
      else if (this.hours_worked >= 3) this.status = 'Half-day';
      else this.status = 'Absent';
    }
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
