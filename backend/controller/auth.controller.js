import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER (for admin setup)
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 👉 SET TOKEN IN COOKIE
    res.cookie("token", token, {
      httpOnly: true,        // prevents JS access (security)
      secure: false,         // true in production (HTTPS)
      sameSite: "strict",    // CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
 // 👉 SET TOKEN IN COOKIE
    res.cookie("token", token, {
      httpOnly: true,        // prevents JS access (security)
      secure: false,         // true in production (HTTPS)
      sameSite: "strict",    // CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token:token
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



