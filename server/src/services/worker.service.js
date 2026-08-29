import Application from "../models/Application.js";
import WorkerProfile from "../models/WorkerProfile.js";
import { calculateTrustScore, refreshTrustScore } from "./trust-score.service.js";

export { calculateTrustScore as computeTrustScore };

const serviceError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

export const getWorkerProfile = (id) => WorkerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });

const requireProfile = async (id) => {
  const profile = await getWorkerProfile(id);
  if (!profile) throw serviceError("Worker profile not found.", 404);
  return profile;
};

export const updateWorkerProfile = async (id, updates) => {
  const profile = await requireProfile(id);
  Object.assign(profile, updates);
  await profile.save();
  return refreshTrustScore(profile._id);
};

export const getWorkerSkills = async (id) => {
  const profile = await requireProfile(id);
  return profile.skills || [];
};

export const addWorkerSkill = async (id, skill) => {
  const profile = await requireProfile(id);
  if (!skill?.name) throw serviceError("Skill name is required.", 400);
  profile.skills.push({ name: skill.name, skillId: skill.skillId, verificationStatus: skill.verificationStatus || "SELF_DECLARED", verified: false });
  await profile.save();
  return refreshTrustScore(profile._id);
};

export const updateWorkerSkill = async (id, skillId, updates) => {
  const profile = await requireProfile(id);
  const skill = profile.skills.id(skillId);
  if (!skill) throw serviceError("Skill not found.", 404);
  Object.assign(skill, updates);
  await profile.save();
  return refreshTrustScore(profile._id);
};

export const removeWorkerSkill = async (id, skillId) => {
  const profile = await requireProfile(id);
  profile.skills.pull(skillId);
  await profile.save();
  return refreshTrustScore(profile._id);
};

export const getWorkerCertifications = async (id) => {
  const profile = await requireProfile(id);
  return profile.certifications || [];
};

export const addWorkerCertification = async (id, certification) => {
  const profile = await requireProfile(id);
  const { name, issuer, issueDate, expiryDate, documentUrl } = certification || {};
  if (!name || !issuer) throw serviceError("Name and issuer are required.", 400);
  profile.certifications.push({ name, issuer, issueDate, expiryDate, documentUrl, verified: false });
  await profile.save();
  return refreshTrustScore(profile._id);
};

export const getWorkerWorkHistory = async (id) => {
  const profile = await requireProfile(id);
  return profile.workHistory || [];
};

export const addWorkerWorkHistory = async (id, entry) => {
  const profile = await requireProfile(id);
  profile.workHistory.push(entry || {});
  await profile.save();
  return refreshTrustScore(profile._id);
};

export const getWorkerApplications = (workerId) =>
  Application.find({ workerId }).populate("jobId").sort({ createdAt: -1 });

export const applyForJob = async ({ jobId, notes = "" }, userId) => {
  if (!jobId) throw serviceError("Job id is required.", 400);
  const existing = await Application.exists({ jobId, workerId: userId });
  if (existing) throw serviceError("Already applied to this job.", 409);
  return Application.create({ jobId, workerId: userId, notes, status: "APPLIED", appliedAt: new Date() });
};
