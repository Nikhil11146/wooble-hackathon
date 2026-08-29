export const calculateTrustScore = (profile) => {
  const verified = (profile.skills || []).filter((skill) => skill.verified || skill.verificationStatus === "APPROVED").length;
  const experience = Number(profile.yearsOfExperience || 0);
  const rating = Number(profile.averageRating || 0);
  const jobs = Number(profile.completedJobsCount || 0);
  const certifications = (profile.certifications || []).length;
  const breakdown = {
    verifiedSkills: verified >= 11 ? 25 : verified >= 6 ? 18 : verified >= 3 ? 10 : 0,
    experience: experience >= 10 ? 18 : experience >= 5 ? 16 : experience >= 2 ? 12 : experience >= 1 ? 6 : experience > 0 ? 3 : 0,
    employerRatings: rating >= 4.5 ? 20 : rating >= 4 ? 17 : rating >= 3.5 ? 12 : rating >= 3 ? 5 : 0,
    completedJobs: jobs >= 20 ? 14 : jobs >= 11 ? 12 : jobs >= 4 ? 9 : jobs >= 1 ? 4 : 0,
    certifications: certifications >= 4 ? 10 : certifications >= 2 ? 6 : certifications ? 3 : 0,
    assessmentPass: profile.assessmentPassed ? 8 : 0,
    profileCompleteness: [profile.profilePhoto, profile.skills?.length, profile.workHistory?.length, profile.certifications?.length, profile.languages?.length].filter(Boolean).length,
  };
  return { total: Math.min(100, Object.values(breakdown).reduce((sum, value) => sum + value, 0)), breakdown };
};
