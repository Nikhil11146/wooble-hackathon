import User from "../models/User.js";
import WorkerProfile from "../models/WorkerProfile.js";
import EmployerProfile from "../models/EmployerProfile.js";
import { generateRefreshToken, generateToken, verifyRefreshToken } from "../utils/jwt.js";
import { comparePassword, hashPassword } from "../utils/password.js";

const serviceError = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const sessionFor = (user) => ({
  user: { id: user._id, email: user.email, role: user.role, verified: user.verified },
  token: generateToken({ id: user._id, role: user.role }),
  refreshToken: generateRefreshToken({ id: user._id, role: user.role }),
});

export const registerUser = async ({ email, password, role, name, companyName, phone, ...profileData }) => {
  if (!email || !password || !role) throw serviceError("Email, password, and role are required.", 400);
  if (!['WORKER', 'EMPLOYER', 'ADMIN'].includes(role)) throw serviceError("Invalid user role.", 400);
  if (await User.exists({ email: email.toLowerCase() })) throw serviceError("User already exists with this email.", 409);

  const user = await User.create({ email, password: await hashPassword(password), role, verified: role === "ADMIN" });
  let profile = null;
  if (role === "WORKER") profile = await WorkerProfile.create({ userId: user._id, name: name || "New Worker", phone: phone || "", ...profileData });
  if (role === "EMPLOYER") profile = await EmployerProfile.create({ userId: user._id, companyName: companyName || "New Company", phone: phone || "", ...profileData });
  return { ...sessionFor(user), profile };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) throw serviceError("Email and password are required.", 400);
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await comparePassword(password, user.password))) throw serviceError("Invalid email or password.", 401);
  const profile = user.role === "WORKER" ? await WorkerProfile.findOne({ userId: user._id }) : user.role === "EMPLOYER" ? await EmployerProfile.findOne({ userId: user._id }) : null;
  return { ...sessionFor(user), profile };
};

export const refreshSession = async (refreshToken) => {
  if (!refreshToken) throw serviceError("Refresh token is required.", 400);
  let decoded;
  try { decoded = verifyRefreshToken(refreshToken); } catch { throw serviceError("Invalid or expired refresh token.", 401); }
  const user = await User.findById(decoded.id);
  if (!user) throw serviceError("User not found.", 401);
  return { token: generateToken({ id: user._id, role: user.role }), refreshToken: generateRefreshToken({ id: user._id, role: user.role }) };
};
