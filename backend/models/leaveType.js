import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["Casual", "Sick", "Earned", "Unpaid"]
    },
    max_days_per_year: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("LeaveType", leaveTypeSchema);