import Verification from "../models/Verification.js";
import WorkerProfile from "../models/WorkerProfile.js";
import { computeTrustScore } from "./worker.controller.js";

// POST /api/verifications/request
export const requestVerification = async (req, res) => {
  try {
    const { workerId, skillName, skillId, verificationType, documentUrl, notes } = req.body;

    if (!workerId || !skillName) {
      return res.status(400).json({ success: false, message: "WorkerId and skillName are required." });
    }

    const verification = await Verification.create({
      workerId,
      skillName,
      skillId,
      verificationType: verificationType || "DOCUMENT",
      documentUrl: documentUrl || "",
      notes: notes || "",
      verificationStatus: "PENDING",
    });

    // Mark skill verificationStatus as PENDING in worker profile
    const profile = await WorkerProfile.findOne({
      $or: [{ _id: workerId }, { userId: workerId }],
    });

    if (profile) {
      const existingSkill = profile.skills.find(
        (s) => s.name?.toLowerCase() === skillName.toLowerCase()
      );
      if (existingSkill) {
        existingSkill.verificationStatus = "PENDING";
      } else {
        profile.skills.push({
          name: skillName,
          verificationStatus: "PENDING",
          verified: false,
        });
      }
      await profile.save();
    }

    return res.status(201).json({
      success: true,
      message: "Verification request submitted successfully.",
      data: verification,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/verifications/:workerId
export const getWorkerVerifications = async (req, res) => {
  try {
    const { workerId } = req.params;
    const verifications = await Verification.find({ workerId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: verifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/verifications (or pending verifications)
export const getPendingVerifications = async (req, res) => {
  try {
    const verifications = await Verification.find({ verificationStatus: "PENDING" })
      .populate("workerId", "email role")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: verifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/verifications/:id/approve
export const approveVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const verification = await Verification.findById(id);
    if (!verification) {
      return res.status(404).json({ success: false, message: "Verification record not found." });
    }

    verification.verificationStatus = "APPROVED";
    verification.verifiedAt = new Date();
    verification.verifierId = req.user?.id;
    verification.verifierType = req.user?.role || "ADMIN";
    if (notes) verification.notes = notes;
    await verification.save();

    // Update Worker Profile skill status and recalculate trust score
    const profile = await WorkerProfile.findOne({
      $or: [{ _id: verification.workerId }, { userId: verification.workerId }],
    });

    if (profile) {
      const targetSkill = profile.skills.find(
        (s) => s.name?.toLowerCase() === verification.skillName.toLowerCase()
      );
      if (targetSkill) {
        targetSkill.verificationStatus = "APPROVED";
        targetSkill.verified = true;
      }

      const trustScore = computeTrustScore(profile);
      profile.kaushalTrustScore = trustScore.total;
      profile.trustScoreBreakdown = trustScore.breakdown;
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: "Verification approved successfully.",
      data: verification,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/verifications/:id/reject
export const rejectVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const verification = await Verification.findById(id);
    if (!verification) {
      return res.status(404).json({ success: false, message: "Verification record not found." });
    }

    verification.verificationStatus = "REJECTED";
    verification.verifiedAt = new Date();
    verification.verifierId = req.user?.id;
    if (notes) verification.notes = notes;
    await verification.save();

    // Update Worker Profile skill
    const profile = await WorkerProfile.findOne({
      $or: [{ _id: verification.workerId }, { userId: verification.workerId }],
    });

    if (profile) {
      const targetSkill = profile.skills.find(
        (s) => s.name?.toLowerCase() === verification.skillName.toLowerCase()
      );
      if (targetSkill) {
        targetSkill.verificationStatus = "REJECTED";
        targetSkill.verified = false;
      }
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: "Verification rejected.",
      data: verification,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
