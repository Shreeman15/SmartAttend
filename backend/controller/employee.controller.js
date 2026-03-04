import Employee from "../models/employee.js"

/**
 * @desc   Create employee
 * @route  POST /api/employees
 * @access Admin
 */
export const createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);

    res.status(201).json({
      success: true,
      data: employee,
    });
    console.log("Employee created:", employee);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    console.log(error)
  }
};

/**
 * @desc   Get all employees
 * @route  GET /api/employees
 * @access Admin
 */
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();

    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Get employee by ID
 * @route  GET /api/employees/:id
 * @access Admin
 */
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid ID" });
  }
};

/**
 * @desc   Update employee
 * @route  PUT /api/employees/:id
 * @access Admin
 */
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};