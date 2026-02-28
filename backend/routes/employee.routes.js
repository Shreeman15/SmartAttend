import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
} from "../controller/employee.controller.js";

import { protect, isAdmin } from "../middleware/auth.middleware.js";

const employeeRoutes= express.Router();

employeeRoutes.post("/employees", protect, isAdmin, createEmployee);
employeeRoutes.get("/employees", protect, isAdmin, getEmployees);
employeeRoutes.get("/employees/:id", protect, isAdmin, getEmployeeById);
employeeRoutes.put("/employees/:id", protect, isAdmin, updateEmployee);

export default employeeRoutes;

// import express from "express";
// import { protect, isAdmin } from "../middleware/authMiddleware.js";
// import { getEmployees } from "../controller/employeeController.js";

// const router = express.Router();

// router.get("/employees", protect, isAdmin, getEmployees);

// export default router;