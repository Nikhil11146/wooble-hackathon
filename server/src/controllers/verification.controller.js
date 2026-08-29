import Verification from "../models/Verification.js";
import { requestSkillVerification, reviewVerification } from "../services/verification.service.js";

const sendError = (res, error) => res.status(error.statusCode || 500).json({ success: false, message: error.message });

export const requestVerification = async (req, res) => {
  try {
    const verification = await requestSkillVerification(req.body);
    return res.status(201).json({ success: true, message: "Verification request submitted successfully.", data: verification });
  } catch (error) { return sendError(res, error); }
};

export const getWorkerVerifications = async (req, res) => {
  try {
    const verifications = await Verification.find({ workerId: req.params.workerId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: verifications });
  } catch (error) { return sendError(res, error); }
};

export const getPendingVerifications = async (_req, res) => {
  try {
    const verifications = await Verification.find({ verificationStatus: "PENDING" }).populate("workerId", "email role").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: verifications });
  } catch (error) { return sendError(res, error); }
};

const review = (status, message) => async (req, res) => {
  try {
    const verification = await reviewVerification(req.params.id, req.user, status, req.body.notes);
    return res.status(200).json({ success: true, message, data: verification });
  } catch (error) { return sendError(res, error); }
};

export const approveVerification = review("APPROVED", "Verification approved successfully.");
export const rejectVerification = review("REJECTED", "Verification rejected.");
