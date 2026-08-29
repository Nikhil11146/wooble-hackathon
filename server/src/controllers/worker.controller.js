import WorkerProfile from "../models/WorkerProfile.js";
import Job from "../models/Job.js";
import {
  addWorkerCertification as serviceAddCertification,
  addWorkerSkill as serviceAddSkill,
  addWorkerWorkHistory as serviceAddWorkHistory,
  applyForJob,
  computeTrustScore,
  getWorkerApplications as serviceGetApplications,
  getWorkerCertifications as serviceGetCertifications,
  getWorkerProfile as serviceGetProfile,
  getWorkerSkills as serviceGetSkills,
  getWorkerWorkHistory as serviceGetWorkHistory,
  removeWorkerSkill as serviceRemoveSkill,
  updateWorkerProfile as serviceUpdateProfile,
  updateWorkerSkill as serviceUpdateSkill,
} from "../services/worker.service.js";

const sendError = (res, error) => res.status(error.statusCode || 500).json({ success: false, message: error.message });

// GET /api/workers/me
export const getMyProfile = async (req, res) => {
  try {
    const profile = await serviceGetProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/workers/:id/profile or /api/workers/:id
export const getWorkerProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    let profile = await WorkerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return sendError(res, error);
  }
};

// PUT /api/workers/:id or PUT /api/workers/:id/profile
export const updateWorkerProfileById = async (req, res) => {
  try {
    const profile = await serviceUpdateProfile(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Profile updated successfully.", data: profile });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/workers/:id/skills
export const getSkills = async (req, res) => {
  try {
    const skills = await serviceGetSkills(req.params.id);
    return res.status(200).json({ success: true, data: skills });
  } catch (error) {
    return sendError(res, error);
  }
};

// POST /api/workers/:id/skills
export const addSkill = async (req, res) => {
  try {
    const profile = await serviceAddSkill(req.params.id, req.body);
    return res.status(201).json({ success: true, message: "Skill added successfully.", data: profile.skills });
  } catch (error) {
    return sendError(res, error);
  }
};

// PUT /api/workers/:id/skills/:skillId
export const updateSkill = async (req, res) => {
  try {
    const profile = await serviceUpdateSkill(req.params.id, req.params.skillId, req.body);
    return res.status(200).json({ success: true, message: "Skill updated successfully.", data: profile.skills });
  } catch (error) {
    return sendError(res, error);
  }
};

// DELETE /api/workers/:id/skills/:skillId
export const removeSkill = async (req, res) => {
  try {
    const profile = await serviceRemoveSkill(req.params.id, req.params.skillId);
    return res.status(200).json({ success: true, message: "Skill removed successfully.", data: profile.skills });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/workers/:id/certifications
export const getCertifications = async (req, res) => {
  try {
    const certifications = await serviceGetCertifications(req.params.id);
    return res.status(200).json({ success: true, data: certifications });
  } catch (error) {
    return sendError(res, error);
  }
};

// POST /api/workers/:id/certifications
export const addCertification = async (req, res) => {
  try {
    const profile = await serviceAddCertification(req.params.id, req.body);
    return res.status(201).json({ success: true, message: "Certification added successfully.", data: profile.certifications });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/workers/:id/work-history
export const getWorkHistory = async (req, res) => {
  try {
    const workHistory = await serviceGetWorkHistory(req.params.id);
    return res.status(200).json({ success: true, data: workHistory });
  } catch (error) {
    return sendError(res, error);
  }
};

// POST /api/workers/:id/work-history
export const addWorkHistory = async (req, res) => {
  try {
    const profile = await serviceAddWorkHistory(req.params.id, req.body);
    return res.status(201).json({ success: true, message: "Work history added successfully.", data: profile.workHistory });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/workers/:id/trust-score
export const getTrustScore = async (req, res) => {
  try {
    const profile = await serviceGetProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }
    const scoreData = computeTrustScore(profile);
    return res.status(200).json({ success: true, data: { score: scoreData.total, breakdown: scoreData.breakdown } });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/workers/:id/applications
export const getWorkerApplicationsById = async (req, res) => {
  try {
    const applications = await serviceGetApplications(req.params.id);
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/jobs/recommended
export const getRecommendedJobs = async (req, res) => {
  try {
    const workerProfile = await WorkerProfile.findOne({ userId: req.user?.id || req.query.workerId });
    const jobs = await Job.find({ status: "OPEN" });

    if (!workerProfile) {
      return res.status(200).json({ success: true, data: jobs });
    }

    const workerSkills = (workerProfile.skills || []).map((s) => s.name?.toLowerCase());

    const scoredJobs = jobs.map((job) => {
      const required = job.requiredSkills || [];
      let matchScore = 50;
      if (required.length > 0) {
        const matched = required.filter((r) => workerSkills.includes(r.toLowerCase())).length;
        matchScore = Math.round((matched / required.length) * 100);
      }
      return { ...job.toObject(), matchScore };
    });

    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
    return res.status(200).json({ success: true, data: scoredJobs });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/jobs/search
export const searchJobs = async (req, res) => {
  try {
    const { query, category, location, minSalary, maxSalary, employmentType } = req.query;
    const filter = { status: "OPEN" };

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (employmentType) filter.employmentType = employmentType;
    if (minSalary) filter["salary.min"] = { $gte: Number(minSalary) };
    if (maxSalary) filter["salary.max"] = { $lte: Number(maxSalary) };

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/jobs/:id
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }
    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    return sendError(res, error);
  }
};

// POST /api/applications
export const applyToJob = async (req, res) => {
  try {
    const application = await applyForJob(req.body, req.user.id);
    return res.status(201).json({ success: true, message: "Application submitted successfully.", data: application });
  } catch (error) {
    return sendError(res, error);
  }
};
