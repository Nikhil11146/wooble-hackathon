import { loginUser, refreshSession, registerUser } from "../services/auth.service.js";

const sendServiceError = (res, error) =>
  res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal server error." });

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const data = await registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data,
    });
  } catch (error) {
    return sendServiceError(res, error);
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data,
    });
  } catch (error) {
    return sendServiceError(res, error);
  }
};

// POST /api/auth/refresh
export const refresh = async (req, res) => {
  try {
    const data = await refreshSession(req.body.refreshToken);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendServiceError(res, error);
  }
};

// POST /api/auth/logout
export const logout = async (_req, res) =>
  res.status(200).json({ success: true, message: "Logged out successfully." });
