import Verification from "../models/Verification.js";
import { createNotification } from "./notification.service.js";
import { refreshTrustScore } from "./trust-score.service.js";
import WorkerProfile from "../models/WorkerProfile.js";

const serviceError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

export const requestSkillVerification = async ({ workerId, skillName, skillId, verificationType = "DOCUMENT", documentUrl = "", notes = "" }) => {
  if (!workerId || !skillName) throw serviceError("WorkerId and skillName are required.", 400);
  const verification = await Verification.create({ workerId, skillName, skillId, verificationType, documentUrl, notes });
  const profile = await WorkerProfile.findOne({ $or: [{ _id: workerId }, { userId: workerId }] });
  if (profile) {
    const skill = profile.skills.find((item) => item.name?.toLowerCase() === skillName.toLowerCase());
    if (skill) skill.verificationStatus = "PENDING";
    else profile.skills.push({ name: skillName, skillId, verificationStatus: "PENDING", verified: false });
    await profile.save();
  }
  return verification;
};

export const reviewVerification = async (verificationId, verifier, status, notes) => {
  if (!["APPROVED", "REJECTED"].includes(status)) throw serviceError("Invalid verification status.", 400);
  const verification = await Verification.findById(verificationId);
  if (!verification) throw serviceError("Verification record not found.", 404);
  Object.assign(verification, { verificationStatus: status, verifierId: verifier.id, verifierType: verifier.role, verifiedAt: new Date() });
  if (notes !== undefined) verification.notes = notes;
  await verification.save();
  const profile = await WorkerProfile.findOne({ $or: [{ _id: verification.workerId }, { userId: verification.workerId }] });
  if (profile) {
    const skill = profile.skills.find((item) => item.name?.toLowerCase() === verification.skillName.toLowerCase());
    if (skill) { skill.verificationStatus = status; skill.verified = status === "APPROVED"; await profile.save(); }
    await refreshTrustScore(profile._id);
  }
  await createNotification({ userId: verification.workerId, type: "VERIFICATION_COMPLETE", resourceId: verification._id, title: "Verification reviewed", message: `Your ${verification.skillName} verification was ${status.toLowerCase()}.` });
  return verification;
};
