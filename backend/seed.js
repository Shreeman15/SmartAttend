const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Employee = require('./models/employee');
const Attendance = require('./models/attendance');
const LeaveRequest = require('./models/LeaveRequest');

const employees = [
  { name: 'Arjun Sharma',    email: 'arjun@company.com',    department: 'Engineering', designation: 'Senior Developer',  base_salary: 85000, joining_date: '2022-03-15' },
  { name: 'Priya Patel',     email: 'priya@company.com',    department: 'HR',          designation: 'HR Manager',        base_salary: 75000, joining_date: '2021-06-01', role: 'manager' },
  { name: 'Ravi Kumar',      email: 'ravi@company.com',     department: 'Finance',     designation: 'Finance Analyst',   base_salary: 70000, joining_date: '2023-01-10' },
  { name: 'Sneha Reddy',     email: 'sneha@company.com',    department: 'Marketing',   designation: 'Marketing Lead',    base_salary: 72000, joining_date: '2022-08-20' },
  { name: 'Vikram Singh',    email: 'vikram@company.com',   department: 'Engineering', designation: 'Tech Lead',         base_salary: 95000, joining_date: '2020-11-05' },
  { name: 'Anjali Gupta',    email: 'anjali@company.com',   department: 'Operations',  designation: 'Ops Manager',       base_salary: 80000, joining_date: '2021-04-12', role: 'manager' },
  { name: 'Rohan Mehta',     email: 'rohan@company.com',    department: 'Sales',       designation: 'Sales Executive',   base_salary: 60000, joining_date: '2023-05-01' },
  { name: 'Divya Nair',      email: 'divya@company.com',    department: 'Engineering', designation: 'Junior Developer',  base_salary: 55000, joining_date: '2024-01-15' },
  { name: 'Karan Joshi',     email: 'karan@company.com',    department: 'Finance',     designation: 'Accountant',        base_salary: 62000, joining_date: '2022-09-20' },
  { name: 'Meera Iyer',      email: 'meera@company.com',    department: 'HR',          designation: 'HR Executive',      base_salary: 58000, joining_date: '2023-03-01' },
  { name: 'Admin User',      email: 'admin@company.com',    department: 'HR',          designation: 'System Admin',      base_salary: 90000, joining_date: '2020-01-01', role: 'admin' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await LeaveRequest.deleteMany({});
    console.log('Cleared existing data');

    // Create employees
    const createdEmps = [];
    for (const emp of employees) {
      const e = await Employee.create({ ...emp, password: 'Hr@1234' });
      createdEmps.push(e);
      console.log(`Created: ${e.name}`);
    }

    // Seed attendance for current month
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const mm = String(month).padStart(2, '0');

    const statuses = ['Present', 'Present', 'Present', 'Present', 'Absent', 'Half-day', 'Present'];
    for (const emp of createdEmps.slice(0, 8)) {
      for (let d = 1; d <= today.getDate(); d++) {
        const dateObj = new Date(year, month - 1, d);
        const dayOfWeek = dateObj.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

        const dateStr = `${year}-${mm}-${String(d).padStart(2, '0')}`;
        const doj = new Date(emp.joining_date).toISOString().split('T')[0];
        if (dateStr < doj) continue;

        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const checkIn  = status !== 'Absent' ? '09:' + String(Math.floor(Math.random() * 30)).padStart(2,'0') : null;
        const checkOut = status === 'Present' ? '18:' + String(Math.floor(Math.random() * 30)).padStart(2,'0')
                       : status === 'Half-day' ? '13:' + String(Math.floor(Math.random() * 30)).padStart(2,'0') : null;

        await Attendance.create({ employee_id: emp._id, date: dateStr, check_in: checkIn, check_out: checkOut, status });
      }
    }
    console.log('Seeded attendance records');

    // Seed a leave request
    const emp0 = createdEmps[0];
    const futureStart = new Date(today);
    futureStart.setDate(futureStart.getDate() + 3);
    const futureEnd = new Date(futureStart);
    futureEnd.setDate(futureEnd.getDate() + 2);
    await LeaveRequest.create({
      employee_id: emp0._id,
      leave_type: 'Casual',
      start_date: futureStart.toISOString().split('T')[0],
      end_date:   futureEnd.toISOString().split('T')[0],
      total_days: 3,
      reason: 'Family function',
      status: 'Pending'
    });
    console.log('Seeded leave request');

    console.log('\n✅ Seed complete!');
    console.log('Login with: admin@company.com / Hr@1234');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
