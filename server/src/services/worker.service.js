import Application from "../models/Application.js";
import WorkerProfile from "../models/WorkerProfile.js";
import { refreshTrustScore } from "./trust-score.service.js";

const serviceError = (message, statusCode) => Object.assign(new Error(message), { statusCode });
export const getWorkerProfile = (id) => WorkerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });

export const updateWorkerProfile = async (id, updates) => {
  const profile = await getWorkerProfile(id);
  if (!profile) throw serviceError("Worker profile not found.", 404);
  Object.assign(profile, updates);
  await profile.save();
  return refreshTrustScore(profile._id);
};

export const addWorkerSkill = async (id, skill) => {
  const profile = await getWorkerProfile(id);
  if (!profile) throw serviceError("Worker profile not found.", 404);
  if (!skill?.name) throw serviceError("Skill name is required.", 400);
  profile.skills.push({ name: skill.name, skillId: skill.skillId, verificationStatus: skill.verificationStatus || "SELF_DECLARED", verified: false });
  await profile.save();
  return refreshTrustScore(profile._id);
};

export const getWorkerApplications = (workerId) =>
  Application.find({ workerId }).populate("jobId").sort({ createdAt: -1 });

export const applyForJob = async ({ jobId, workerId, notes = "" }) => {
  const existing = await Application.exists({ jobId, workerId });
  if (existing) throw serviceError("Already applied to this job.", 409);
  return Application.create({ jobId, workerId, notes, status: "APPLIED", appliedAt: new Date() });
};
