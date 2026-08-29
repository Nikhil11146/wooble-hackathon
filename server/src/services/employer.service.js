import Application from "../models/Application.js";
import EmployerProfile from "../models/EmployerProfile.js";
import Job from "../models/Job.js";
import WorkerProfile from "../models/WorkerProfile.js";
import { createNotification } from "./notification.service.js";

const serviceError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

export const getEmployerProfile = (id) => EmployerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });

export const updateEmployerProfile = async (id, updates) => {
  const profile = await EmployerProfile.findOneAndUpdate(
    { $or: [{ _id: id }, { userId: id }] },
    updates,
    { new: true },
  );
  if (!profile) throw serviceError("Employer profile not found.", 404);
  return profile;
};

export const getEmployerJobs = (employerId) => Job.find({ employerId }).sort({ createdAt: -1 });

export const createEmployerJob = (employerId, data) => Job.create({ ...data, employerId });

export const updateJob = async (jobId, updates, employerId) => {
  const job = await Job.findOneAndUpdate({ _id: jobId, employerId }, updates, { new: true });
  if (!job) throw serviceError("Job not found.", 404);
  return job;
};

export const closeJob = async (jobId, employerId) => {
  const job = await Job.findOneAndUpdate({ _id: jobId, employerId }, { status: "CLOSED" }, { new: true });
  if (!job) throw serviceError("Job not found.", 404);
  return job;
};

export const getAllCandidates = () =>
  WorkerProfile.find().populate("userId", "email verified");

export const searchCandidates = (filters) => {
  const { skill, occupation, minExperience, availability, maxSalary } = filters || {};
  const filter = {};
  if (occupation) filter.primaryOccupation = { $regex: occupation, $options: "i" };
  if (availability) filter.availability = availability;
  if (minExperience) filter.yearsOfExperience = { $gte: Number(minExperience) };
  if (maxSalary) filter["expectedSalary.min"] = { $lte: Number(maxSalary) };
  if (skill) filter["skills.name"] = { $regex: skill, $options: "i" };
  return WorkerProfile.find(filter).sort({ kaushalTrustScore: -1 });
};

export const getCandidateDetails = async (workerId) => {
  const candidate = await WorkerProfile.findOne({
    $or: [{ _id: workerId }, { userId: workerId }],
  }).populate("userId", "email verified");
  if (!candidate) throw serviceError("Candidate not found.", 404);
  return candidate;
};

export const shortlistCandidate = async ({ workerId, jobId }) => {
  let application = await Application.findOne({ jobId, workerId });
  if (application) {
    application.status = "SHORTLISTED";
    await application.save();
  } else {
    application = await Application.create({ jobId, workerId, status: "SHORTLISTED" });
  }
  return application;
};

export const getPipeline = async (employerId, jobId) => {
  const query = {};
  if (jobId) {
    const job = await Job.findOne({ _id: jobId, employerId }).select("_id");
    if (!job) throw serviceError("Job not found.", 404);
    query.jobId = jobId;
  } else {
    const employerJobs = await Job.find({ employerId }).select("_id");
    query.jobId = { $in: employerJobs.map((j) => j._id) };
  }

  const applications = await Application.find(query).populate("jobId").populate("workerId");

  return {
    APPLIED: applications.filter((a) => a.status === "APPLIED"),
    SHORTLISTED: applications.filter((a) => a.status === "SHORTLISTED"),
    INTERVIEW: applications.filter((a) => a.status === "INTERVIEW"),
    HIRED: applications.filter((a) => a.status === "HIRED"),
    REJECTED: applications.filter((a) => a.status === "REJECTED"),
  };
};

export const updateApplicationStatus = async (applicationId, status, notes, employerId) => {
  const application = await Application.findById(applicationId);
  if (!application) throw serviceError("Application not found.", 404);

  const job = await Job.findOne({ _id: application.jobId, employerId }).select("_id");
  if (!job) throw serviceError("You do not have permission to update this application.", 403);

  application.status = status;
  if (notes !== undefined) application.notes = notes;
  if (status === "INTERVIEW") application.movedToInterviewAt = new Date();
  if (status === "HIRED") {
    application.hiredAt = new Date();
    await WorkerProfile.findOneAndUpdate(
      { userId: application.workerId },
      { $inc: { completedJobsCount: 1 } },
    );
  }
  await application.save();
  await createNotification({ userId: application.workerId, type: "APPLICATION_STATUS", resourceId: application._id, title: "Application updated", message: `Your application status is now ${status}.` });
  return application;
};

export const getEmployerAnalytics = async (employerId) => {
  const jobs = await Job.find({ employerId });
  const jobIds = jobs.map((j) => j._id);
  const applications = await Application.find({ jobId: { $in: jobIds } });

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === "OPEN").length;
  const totalApplicants = applications.length;
  const hiredCount = applications.filter((a) => a.status === "HIRED").length;
  const interviewCount = applications.filter((a) => a.status === "INTERVIEW").length;

  return {
    totalJobs,
    activeJobs,
    totalApplicants,
    hiredCount,
    interviewCount,
    conversionRate: totalApplicants > 0 ? Math.round((hiredCount / totalApplicants) * 100) : 0,
  };
};
