import User from "../models/User.js";
import WorkerProfile from "../models/WorkerProfile.js";
import EmployerProfile from "../models/EmployerProfile.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { email, password, role, name, companyName, phone, ...rest } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "Email, password, and role are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this email." });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      verified: role === "ADMIN",
    });

    let profile = null;
    if (role === "WORKER") {
      profile = await WorkerProfile.create({
        userId: user._id,
        name: name || "New Worker",
        phone: phone || "",
        ...rest,
      });
    } else if (role === "EMPLOYER") {
      profile = await EmployerProfile.create({
        userId: user._id,
        companyName: companyName || "New Company",
        phone: phone || "",
        ...rest,
      });
    }

    const token = generateToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          verified: user.verified,
        },
        profile,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    let profile = null;
    if (user.role === "WORKER") {
      profile = await WorkerProfile.findOne({ userId: user._id });
    } else if (user.role === "EMPLOYER") {
      profile = await EmployerProfile.findOne({ userId: user._id });
    }

    const token = generateToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          verified: user.verified,
        },
        profile,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/refresh
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required." });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    const newToken = generateToken({ id: user._id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id, role: user.role });

    return res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token." });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};
