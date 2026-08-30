import WorkerProfile from "../models/WorkerProfile.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import {
  addWorkerSkill as addSkill,
  applyForJob,
  getWorkerApplications as findWorkerApplications,
  getWorkerProfile as findWorkerProfile,
  updateWorkerProfile as updateProfile,
} from "../services/worker.service.js";

// Helper function to calculate trust score based on specs
export const computeTrustScore = (profile) => {
  let verifiedSkillsScore = 0;
  const verifiedSkillsCount = (profile.skills || []).filter((s) => s.verified || s.verificationStatus === "APPROVED").length;
  if (verifiedSkillsCount >= 11) verifiedSkillsScore = 25;
  else if (verifiedSkillsCount >= 6) verifiedSkillsScore = 18;
  else if (verifiedSkillsCount >= 3) verifiedSkillsScore = 10;

  let experienceScore = 0;
  const exp = profile.yearsOfExperience || 0;
  if (exp >= 10) experienceScore = 18;
  else if (exp >= 5) experienceScore = 16;
  else if (exp >= 2) experienceScore = 12;
  else if (exp >= 1) experienceScore = 6;
  else if (exp > 0) experienceScore = 3;

  let ratingsScore = 0;
  const avgRating = profile.averageRating || 0;
  if (avgRating >= 4.5) ratingsScore = 20;
  else if (avgRating >= 4.0) ratingsScore = 17;
  else if (avgRating >= 3.5) ratingsScore = 12;
  else if (avgRating >= 3.0) ratingsScore = 5;

  let completedJobsScore = 0;
  const jobsCount = profile.completedJobsCount || 0;
  if (jobsCount >= 20) completedJobsScore = 14;
  else if (jobsCount >= 11) completedJobsScore = 12;
  else if (jobsCount >= 4) completedJobsScore = 9;
  else if (jobsCount >= 1) completedJobsScore = 4;

  let certScore = 0;
  const certsCount = (profile.certifications || []).length;
  if (certsCount >= 4) certScore = 10;
  else if (certsCount >= 2) certScore = 6;
  else if (certsCount === 1) certScore = 3;

  let assessmentScore = profile.assessmentPassed ? 8 : 0;

  let completenessScore = 0;
  if (profile.profilePhoto) completenessScore += 1;
  if (profile.skills && profile.skills.length > 0) completenessScore += 1;
  if (profile.workHistory && profile.workHistory.length > 0) completenessScore += 1;
  if (profile.certifications && profile.certifications.length > 0) completenessScore += 1;
  if (profile.languages && profile.languages.length > 0) completenessScore += 1;

  const total = Math.min(100, verifiedSkillsScore + experienceScore + ratingsScore + completedJobsScore + certScore + assessmentScore + completenessScore);

  return {
    total,
    breakdown: {
      verifiedSkills: verifiedSkillsScore,
      experience: experienceScore,
      employerRatings: ratingsScore,
      completedJobs: completedJobsScore,
      certifications: certScore,
      assessmentPass: assessmentScore,
      profileCompleteness: completenessScore,
    },
  };
};

// GET /api/workers/me
export const getMyProfile = async (req, res) => {
  try {
    const profile = await findWorkerProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/workers/:id/profile or /api/workers/:id
export const getWorkerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    let profile = await WorkerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/workers/:id or PUT /api/workers/:id/profile
export const updateWorkerProfile = async (req, res) => {
  try {
    const profile = await updateProfile(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Profile updated successfully.", data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/workers/:id/skills
export const getWorkerSkills = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await WorkerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }
    return res.status(200).json({ success: true, data: profile.skills || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/workers/:id/skills
export const addWorkerSkill = async (req, res) => {
  try {
    const profile = await addSkill(req.params.id, req.body);
    return res.status(201).json({ success: true, message: "Skill added successfully.", data: profile.skills });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/workers/:id/skills/:skillId
export const updateWorkerSkill = async (req, res) => {
  try {
    const { id, skillId } = req.params;
    const profile = await WorkerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }

    const skill = profile.skills.id(skillId);
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found." });
    }

    Object.assign(skill, req.body);
    const trustScore = computeTrustScore(profile);
    profile.kaushalTrustScore = trustScore.total;
    profile.trustScoreBreakdown = trustScore.breakdown;

    await profile.save();
    return res.status(200).json({ success: true, message: "Skill updated successfully.", data: profile.skills });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/workers/:id/skills/:skillId
export const removeWorkerSkill = async (req, res) => {
  try {
    const { id, skillId } = req.params;
    const profile = await WorkerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }

    profile.skills.pull(skillId);
    const trustScore = computeTrustScore(profile);
    profile.kaushalTrustScore = trustScore.total;
    profile.trustScoreBreakdown = trustScore.breakdown;

    await profile.save();
    return res.status(200).json({ success: true, message: "Skill removed successfully.", data: profile.skills });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/workers/:id/certifications
export const getWorkerCertifications = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await WorkerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }
    return res.status(200).json({ success: true, data: profile.certifications || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/workers/:id/certifications
export const addWorkerCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, issuer, issueDate, expiryDate, documentUrl } = req.body;
    const profile = await WorkerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }

    profile.certifications.push({
      name,
      issuer,
      issueDate,
      expiryDate,
      documentUrl,
      verified: false,
    });

    const trustScore = computeTrustScore(profile);
    profile.kaushalTrustScore = trustScore.total;
    profile.trustScoreBreakdown = trustScore.breakdown;

    await profile.save();
    return res.status(201).json({ success: true, message: "Certification added successfully.", data: profile.certifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/workers/:id/work-history
export const getWorkerWorkHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await WorkerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }
    return res.status(200).json({ success: true, data: profile.workHistory || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/workers/:id/work-history
export const addWorkerWorkHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await WorkerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }

    profile.workHistory.push(req.body);
    const trustScore = computeTrustScore(profile);
    profile.kaushalTrustScore = trustScore.total;
    profile.trustScoreBreakdown = trustScore.breakdown;

    await profile.save();
    return res.status(201).json({ success: true, message: "Work history added successfully.", data: profile.workHistory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/workers/:id/trust-score
export const getTrustScore = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await WorkerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }
    const scoreData = computeTrustScore(profile);
    return res.status(200).json({
      success: true,
      data: {
        score: scoreData.total,
        breakdown: scoreData.breakdown,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/workers/:id/applications
export const getWorkerApplications = async (req, res) => {
  try {
    const applications = await findWorkerApplications(req.params.id);
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/jobs/recommended
export const getRecommendedJobs = async (req, res) => {
  try {
    const workerProfile = await WorkerProfile.findOne({ userId: req.user?.id || req.query.workerId }).populate("skills", "name");;
    const jobs = await Job.find({ status: "OPEN" }).populate("requiredSkills", "name");;

    if (!workerProfile) {
      return res.status(200).json({ success: true, data: jobs });
    }

    const workerSkills = (workerProfile.skills || []).map((s) => String(s?.name || s || "").trim().toLowerCase());

    const scoredJobs = jobs.map((job) => {
      const required = job.requiredSkills || [];
      let matchScore = 50; // default base match
      if (required.length > 0) {
        const matched = required.filter((r) => workerSkills.includes(String(r?.name || r || "").trim().toLowerCase())).length;
        matchScore = Math.round((matched / required.length) * 100);
      }
      return {
        ...job.toObject(),
        matchScore,
      };
    });

    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
    return res.status(200).json({ success: true, data: scoredJobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

    const jobs = await Job.find(filter).populate("requiredSkills", "name").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/jobs/:id
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("requiredSkills", "name");
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }
    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/applications
export const applyToJob = async (req, res) => {
  try {
    const application = await applyForJob(req.body);

    return res.status(201).json({ success: true, message: "Application submitted successfully.", data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
