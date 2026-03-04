import LeaveType from "../models/leaveType.js";

export const getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find();
    res.status(200).json(leaveTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.create(req.body);
    res.status(201).json(leaveType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};