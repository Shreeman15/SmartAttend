import express from "express";
import {
  applyLeave,
  getAllLeaveRequests,
  getMyLeaveRequests,
  updateLeaveStatus
} from "../controller/leaveRequest.controller.js";

import { protect, isAdmin } from "../middleware/auth.middleware.js";

const leaveRequestRouter = express.Router();

leaveRequestRouter.post("/", protect, applyLeave);
leaveRequestRouter.get("/", protect, isAdmin, getAllLeaveRequests);
leaveRequestRouter.get("/my", protect, getMyLeaveRequests);
leaveRequestRouter.patch("/:id", protect, isAdmin, updateLeaveStatus);

export default leaveRequestRouter;