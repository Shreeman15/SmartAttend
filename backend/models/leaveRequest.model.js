import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },
    leave_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    },
    reason: {
      type: String
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("LeaveRequest", leaveRequestSchema);