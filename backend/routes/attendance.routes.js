import express from "express";
import {
  markAttendance,
  getAttendanceByEmployee,
  getDailyAttendance,
  updateAttendance,
} from "../controller/attendance.controller.js";

import { protect, isAdmin } from "../middleware/auth.middleware.js";

const  attendanceRoutes = express.Router();

// Employee
attendanceRoutes.post("/", protect, markAttendance);

// Admin
attendanceRoutes.get("/", protect, isAdmin, getAttendanceByEmployee);
attendanceRoutes.get("/daily", protect, isAdmin, getDailyAttendance);
attendanceRoutes.put("/:id", protect, isAdmin, updateAttendance);

export default attendanceRoutes;