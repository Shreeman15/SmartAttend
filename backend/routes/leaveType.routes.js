import express from "express";
import { getLeaveTypes, createLeaveType } from "../controller/leaveType.controller.js";
import { protect, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/leave-types",
  protect,
  isAdmin,
  getLeaveTypes
);

router.post(
  "/leave-types",
  protect,
  isAdmin,
  createLeaveType
);

export default router;