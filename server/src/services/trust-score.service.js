import WorkerProfile from "../models/WorkerProfile.js";

export const calculateTrustScore = (profile) => {
  const verifiedSkills = (profile.skills || []).filter((skill) => skill.verified || skill.verificationStatus === "APPROVED").length;
  const experience = Number(profile.yearsOfExperience || 0);
  const rating = Number(profile.averageRating || 0);
  const completedJobs = Number(profile.completedJobsCount || 0);
  const certifications = (profile.certifications || []).length;
  const verifiedSkillsScore = verifiedSkills >= 11 ? 25 : verifiedSkills >= 6 ? 18 : verifiedSkills >= 3 ? 10 : 0;
  const experienceScore = experience >= 10 ? 18 : experience >= 5 ? 16 : experience >= 2 ? 12 : experience >= 1 ? 6 : experience > 0 ? 3 : 0;
  const employerRatings = rating >= 4.5 ? 20 : rating >= 4 ? 17 : rating >= 3.5 ? 12 : rating >= 3 ? 5 : 0;
  const completedJobsScore = completedJobs >= 20 ? 14 : completedJobs >= 11 ? 12 : completedJobs >= 4 ? 9 : completedJobs >= 1 ? 4 : 0;
  const certificationsScore = certifications >= 4 ? 10 : certifications >= 2 ? 6 : certifications === 1 ? 3 : 0;
  const profileCompleteness = [profile.profilePhoto, profile.skills?.length, profile.workHistory?.length, profile.certifications?.length, profile.languages?.length].filter(Boolean).length;
  const breakdown = { verifiedSkills: verifiedSkillsScore, experience: experienceScore, employerRatings, completedJobs: completedJobsScore, certifications: certificationsScore, assessmentPass: profile.assessmentPassed ? 8 : 0, profileCompleteness };
  return { total: Math.min(100, Object.values(breakdown).reduce((sum, score) => sum + score, 0)), breakdown };
};

export const refreshTrustScore = async (workerId) => {
  const profile = await WorkerProfile.findOne({ $or: [{ _id: workerId }, { userId: workerId }] });
  if (!profile) return null;
  const score = calculateTrustScore(profile);
  profile.kaushalTrustScore = score.total;
  profile.trustScoreBreakdown = score.breakdown;
  await profile.save();
  return profile;
};
