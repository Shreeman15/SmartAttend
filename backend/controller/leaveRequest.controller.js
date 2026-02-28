import LeaveRequest from "../models/leaveRequest.model.js";
import LeaveType from "../models/leaveType.js";

/**
 * @desc    Apply for leave
 * @route   POST /api/leave-requests
 * @access  Employee
 */
export const applyLeave = async (req, res) => {
  try {
    const { leave_type_id, start_date, end_date, reason } = req.body;
    const employee_id = req.user._id; // from auth middleware

    if (!leave_type_id || !start_date || !end_date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: "Start date cannot be after end date" });
    }

    // Check leave type exists
    const leaveType = await LeaveType.findById(leave_type_id);
    if (!leaveType) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    // Prevent overlapping leave requests
    const overlappingLeave = await LeaveRequest.findOne({
      employee_id,
      status: { $ne: "Rejected" },
      $or: [
        {
          start_date: { $lte: end_date },
          end_date: { $gte: start_date }
        }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({
        message: "Leave already exists for selected dates"
      });
    }

    const leaveRequest = await LeaveRequest.create({
      employee_id,
      leave_type_id,
      start_date,
      end_date,
      reason
    });

    res.status(201).json({
      message: "Leave request submitted successfully",
      leaveRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all leave requests
 * @route   GET /api/leave-requests
 * @access  Admin
 */
export const getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find()
      .populate("employee_id", "name email department")
      .populate("leave_type_id", "name");

    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get logged-in employee leave requests
 * @route   GET /api/leave-requests/my
 * @access  Employee
 */
export const getMyLeaveRequests = async (req, res) => {
  try {
    const employee_id = req.user._id;

    const leaveRequests = await LeaveRequest.find({ employee_id })
      .populate("leave_type_id", "name");

    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Approve or Reject leave
 * @route   PATCH /api/leave-requests/:id
 * @access  Admin
 */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leaveRequest.status = status;
    await leaveRequest.save();

    res.status(200).json({
      message: `Leave request ${status.toLowerCase()} successfully`,
      leaveRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};