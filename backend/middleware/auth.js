const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized. Please login.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const employee = await Employee.findById(decoded.id).select('-password');
    if (!employee) {
      return res.status(401).json({ success: false, message: 'Employee not found' });
    }
    req.employee = employee;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.employee.role !== 'admin' && req.employee.role !== 'manager') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next();
};
