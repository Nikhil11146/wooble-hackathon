import User from "../models/User.js";
import WorkerProfile from "../models/WorkerProfile.js";
import EmployerProfile from "../models/EmployerProfile.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Verification from "../models/Verification.js";

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/workers
export const getAllWorkers = async (req, res) => {
  try {
    const workers = await WorkerProfile.find()
      .populate("userId", "email verified createdAt")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: workers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/employers
export const getAllEmployers = async (req, res) => {
  try {
    const employers = await EmployerProfile.find()
      .populate("userId", "email verified createdAt")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: employers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("employerId", "email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    const user = await User.findByIdAndUpdate(id, { verified }, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, message: "User status updated.", data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/analytics
export const getPlatformAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWorkers = await WorkerProfile.countDocuments();
    const totalEmployers = await EmployerProfile.countDocuments();
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: "OPEN" });
    const totalApplications = await Application.countDocuments();
    const hiredApplications = await Application.countDocuments({ status: "HIRED" });
    const pendingVerifications = await Verification.countDocuments({ verificationStatus: "PENDING" });
    const approvedVerifications = await Verification.countDocuments({ verificationStatus: "APPROVED" });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalWorkers,
        totalEmployers,
        totalJobs,
        activeJobs,
        totalApplications,
        hiredApplications,
        pendingVerifications,
        approvedVerifications,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/platform-stats
export const getPlatformStats = async (req, res) => {
  try {
    const totalWorkers = await WorkerProfile.countDocuments();
    const totalEmployers = await EmployerProfile.countDocuments();
    const activeJobs = await Job.countDocuments({ status: "OPEN" });
    const successfulHires = await Application.countDocuments({ status: "HIRED" });

    return res.status(200).json({
      success: true,
      data: {
        totalWorkers,
        totalEmployers,
        activeJobs,
        successfulHires,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
