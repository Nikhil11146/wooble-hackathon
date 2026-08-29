import {
  closeJob,
  createEmployerJob,
  getAllCandidates,
  getCandidateDetails,
  getEmployerAnalytics as getAnalytics,
  getEmployerJobs,
  getEmployerProfile,
  getPipeline,
  searchCandidates,
  shortlistCandidate,
  updateApplicationStatus,
  updateEmployerProfile,
  updateJob,
} from "../services/employer.service.js";

const sendError = (res, error) => res.status(error.statusCode || 500).json({ success: false, message: error.message });

// GET /api/employers/me
export const getMyProfile = async (req, res) => {
  try {
    const profile = await getEmployerProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Employer profile not found." });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return sendError(res, error);
  }
};

// PUT /api/employers/:id
export const updateEmployerProfileById = async (req, res) => {
  try {
    const profile = await updateEmployerProfile(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Profile updated successfully.", data: profile });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/employers/:id/jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await getEmployerJobs(req.params.id);
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    return sendError(res, error);
  }
};

// POST /api/employers/:id/jobs
export const createJob = async (req, res) => {
  try {
    const job = await createEmployerJob(req.params.id, req.body);
    return res.status(201).json({ success: true, message: "Job posted successfully.", data: job });
  } catch (error) {
    return sendError(res, error);
  }
};

// PUT /api/employers/:id/jobs/:jobId
export const updateJobById = async (req, res) => {
  try {
    const job = await updateJob(req.params.jobId, req.body, req.user.id);
    return res.status(200).json({ success: true, message: "Job updated successfully.", data: job });
  } catch (error) {
    return sendError(res, error);
  }
};

// DELETE /api/employers/:id/jobs/:jobId
export const deleteJob = async (req, res) => {
  try {
    await closeJob(req.params.jobId, req.user.id);
    return res.status(200).json({ success: true, message: "Job closed/deleted successfully." });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/employers/:id/candidates
export const getCandidates = async (_req, res) => {
  try {
    const candidates = await getAllCandidates();
    return res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/employers/:id/candidates/search
export const searchCandidatesById = async (req, res) => {
  try {
    const candidates = await searchCandidates(req.query);
    return res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/employers/:id/candidates/:workerId/details
export const getCandidateDetailsById = async (req, res) => {
  try {
    const candidate = await getCandidateDetails(req.params.workerId);
    return res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    return sendError(res, error);
  }
};

// POST /api/employers/:id/candidates/:workerId/shortlist
export const shortlistCandidateById = async (req, res) => {
  try {
    const application = await shortlistCandidate({ workerId: req.params.workerId, jobId: req.body.jobId });
    return res.status(200).json({ success: true, message: "Candidate shortlisted.", data: application });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/employers/:id/pipeline
export const getPipelineById = async (req, res) => {
  try {
    const { jobId } = req.query;
    const pipeline = await getPipeline(req.params.id, jobId);
    return res.status(200).json({ success: true, data: pipeline });
  } catch (error) {
    return sendError(res, error);
  }
};

// PUT /api/employers/:id/pipeline/:appId/status
export const updatePipelineStatus = async (req, res) => {
  try {
    const application = await updateApplicationStatus(req.params.appId, req.body.status, req.body.notes, req.user.id);
    return res.status(200).json({ success: true, message: "Status updated.", data: application });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/employers/:id/analytics
export const getEmployerAnalytics = async (req, res) => {
  try {
    const analytics = await getAnalytics(req.params.id);
    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return sendError(res, error);
  }
};
