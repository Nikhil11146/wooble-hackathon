import EmployerProfile from "../models/EmployerProfile.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import WorkerProfile from "../models/WorkerProfile.js";
import { createEmployerJob, getEmployerProfile } from "../services/employer.service.js";

// GET /api/employers/me
export const getMyProfile = async (req, res) => {
  try {
    const profile = await getEmployerProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Employer profile not found." });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/employers/:id
export const updateEmployerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await EmployerProfile.findOneAndUpdate(
      { $or: [{ _id: id }, { userId: id }] },
      req.body,
      { new: true }
    );
    if (!profile) {
      return res.status(404).json({ success: false, message: "Employer profile not found." });
    }
    return res.status(200).json({ success: true, message: "Profile updated successfully.", data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/employers/:id/jobs
export const getEmployerJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const jobs = await Job.find({ employerId: id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/employers/:id/jobs
export const createJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await createEmployerJob(id, req.body);
    return res.status(201).json({ success: true, message: "Job posted successfully.", data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/employers/:id/jobs/:jobId
export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findByIdAndUpdate(jobId, req.body, { new: true });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }
    return res.status(200).json({ success: true, message: "Job updated successfully.", data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/employers/:id/jobs/:jobId
export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findByIdAndUpdate(jobId, { status: "CLOSED" }, { new: true });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }
    return res.status(200).json({ success: true, message: "Job closed/deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/employers/:id/candidates
export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await WorkerProfile.find().populate("userId", "email verified");
    return res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/employers/:id/candidates/search
export const searchCandidates = async (req, res) => {
  try {
    const { skill, occupation, minExperience, availability, maxSalary } = req.query;
    const filter = {};

    if (occupation) filter.primaryOccupation = { $regex: occupation, $options: "i" };
    if (availability) filter.availability = availability;
    if (minExperience) filter.yearsOfExperience = { $gte: Number(minExperience) };
    if (maxSalary) filter["expectedSalary.min"] = { $lte: Number(maxSalary) };
    if (skill) {
      filter["skills.name"] = { $regex: skill, $options: "i" };
    }

    const candidates = await WorkerProfile.find(filter).sort({ kaushalTrustScore: -1 });
    return res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/employers/:id/candidates/:workerId/details
export const getCandidateDetails = async (req, res) => {
  try {
    const { workerId } = req.params;
    const candidate = await WorkerProfile.findOne({
      $or: [{ _id: workerId }, { userId: workerId }],
    }).populate("userId", "email verified");

    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found." });
    }
    return res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/employers/:id/candidates/:workerId/shortlist
export const shortlistCandidate = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { jobId } = req.body;

    let application = await Application.findOne({ jobId, workerId });
    if (application) {
      application.status = "SHORTLISTED";
      await application.save();
    } else {
      application = await Application.create({
        jobId,
        workerId,
        status: "SHORTLISTED",
      });
    }

    return res.status(200).json({ success: true, message: "Candidate shortlisted.", data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/employers/:id/pipeline
export const getPipeline = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobId } = req.query;

    const query = {};
    if (jobId) {
      query.jobId = jobId;
    } else {
      const employerJobs = await Job.find({ employerId: id }).select("_id");
      query.jobId = { $in: employerJobs.map((j) => j._id) };
    }

    const applications = await Application.find(query)
      .populate("jobId")
      .populate("workerId");

    const pipeline = {
      APPLIED: applications.filter((a) => a.status === "APPLIED"),
      SHORTLISTED: applications.filter((a) => a.status === "SHORTLISTED"),
      INTERVIEW: applications.filter((a) => a.status === "INTERVIEW"),
      HIRED: applications.filter((a) => a.status === "HIRED"),
      REJECTED: applications.filter((a) => a.status === "REJECTED"),
    };

    return res.status(200).json({ success: true, data: pipeline });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/employers/:id/pipeline/:appId/status
export const updatePipelineStatus = async (req, res) => {
  try {
    const { appId } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findById(appId);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    application.status = status;
    if (notes) application.notes = notes;
    if (status === "INTERVIEW") application.movedToInterviewAt = new Date();
    if (status === "HIRED") {
      application.hiredAt = new Date();
      await WorkerProfile.findOneAndUpdate(
        { userId: application.workerId },
        { $inc: { completedJobsCount: 1 } }
      );
    }

    await application.save();
    return res.status(200).json({ success: true, message: "Status updated.", data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/employers/:id/analytics
export const getEmployerAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const jobs = await Job.find({ employerId: id });
    const jobIds = jobs.map((j) => j._id);

    const applications = await Application.find({ jobId: { $in: jobIds } });

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === "OPEN").length;
    const totalApplicants = applications.length;
    const hiredCount = applications.filter((a) => a.status === "HIRED").length;
    const interviewCount = applications.filter((a) => a.status === "INTERVIEW").length;

    return res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        totalApplicants,
        hiredCount,
        interviewCount,
        conversionRate: totalApplicants > 0 ? Math.round((hiredCount / totalApplicants) * 100) : 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
