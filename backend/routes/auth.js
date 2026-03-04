const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new employee
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - department
 *               - designation
 *               - base_salary
 *               - joining_date
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               department:
 *                 type: string
 *               designation:
 *                 type: string
 *               base_salary:
 *                 type: number
 *               joining_date:
 *                 type: string
 *               role:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee registered successfully
 *       400:
 *         description: Validation error
 */


// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, designation, base_salary, joining_date, role, phone } = req.body;

    const existing = await Employee.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    if (!name || !email || !password || !department || !designation || !base_salary || !joining_date) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const employee = await Employee.create({
      name, email, password, department, designation,
      base_salary: Number(base_salary),
      joining_date: new Date(joining_date),
      role: role || 'employee',
      phone: phone || ''
    });

    const token = signToken(employee._id);
    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      token,
      employee
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login employee
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */


// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const employee = await Employee.findOne({ email }).select('+password');
    if (!employee)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await employee.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!employee.is_active)
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact HR.' });

    const token = signToken(employee._id);
    employee.password = undefined;
    res.json({ success: true, message: 'Login successful', token, employee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, employee: req.employee });
});

module.exports = router;
