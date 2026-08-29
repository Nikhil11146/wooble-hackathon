import WorkerProfile from "../models/WorkerProfile.js";
import EmployerProfile from "../models/EmployerProfile.js";
import Job from "../models/Job.js";

export const isOwnUserId = (req, paramName = "id") =>
  req.params[paramName] && String(req.params[paramName]) === String(req.user.id);

const ownsProfile = async (Model, req) => {
  if (isOwnUserId(req)) return true;
  const profile = await Model.findOne({ $or: [{ _id: req.params.id }, { userId: req.params.id }] }).select("userId");
  return !!profile && String(profile.userId) === String(req.user.id);
};

/**
 * Restricts a route so the authenticated user can only act on their own
 * worker/employer profile. `:id` may be the profile ObjectId or the user id.
 */
export const ownWorkerProfile = async (req, res, next) => {
  try {
    if (!(await ownsProfile(WorkerProfile, req))) {
      return res.status(403).json({ success: false, message: "You do not have permission to modify this worker profile." });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

export const ownEmployerProfile = async (req, res, next) => {
  try {
    if (!(await ownsProfile(EmployerProfile, req))) {
      return res.status(403).json({ success: false, message: "You do not have permission to modify this employer profile." });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Ensures the employer acting on a job actually owns the job
 * (the job's employerId must belong to the authenticated user).
 */
export const ownJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId).select("employerId");
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }
    if (String(job.employerId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "You do not have permission to modify this job." });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
