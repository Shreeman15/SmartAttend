import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import leaveTypeRoutes from "./routes/leaveType.routes.js";
import leaveRequestRoutes from "./routes/leaveRequest.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

// Connect to DB
connectDB();

// Create Express App
const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(
  session({
    name: "attendance.sid",
    secret: "session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 }, // 1 hour
  })
);

// Routes
app.use("/api/employees", employeeRoutes);
// Alias for clients using singular path
// app.use("/api/employee", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api", leaveTypeRoutes);
app.use("/api/leave-requests", leaveRequestRoutes);
app.use(cookieParser());
app.use(express.json());

// Start Server
const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Attendance Management System API" });
});
