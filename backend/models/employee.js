const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: true },
  department:   { type: String, required: true, enum: ['Engineering','HR','Finance','Marketing','Operations','Sales'] },
  designation:  { type: String, required: true },
  base_salary:  { type: Number, required: true, min: 0 },
  joining_date: { type: Date, required: true },
  role:         { type: String, enum: ['employee','manager','admin'], default: 'employee' },
  is_active:    { type: Boolean, default: true },
  phone:        { type: String, default: '' },
  avatar:       { type: String, default: '' }
}, { timestamps: true });

// Hash password before save
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
employeeSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Remove password from JSON output
employeeSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Employee', employeeSchema);
