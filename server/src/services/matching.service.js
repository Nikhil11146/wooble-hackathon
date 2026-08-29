import Job from "../models/Job.js";

const toId = (value) => String(value?._id || value);
const normalise = (value) => String(value || "").trim().toLowerCase();

export const calculateJobMatch = (worker, job) => {
  const workerSkills = new Set((worker.skills || []).map((skill) => normalise(skill.name || skill.skillId)));
  const requiredSkills = job.requiredSkills || [];
  const matchedSkills = requiredSkills.filter((skill) => workerSkills.has(normalise(skill.name || toId(skill)))).length;
  const skillMatch = requiredSkills.length ? Math.round((matchedSkills / requiredSkills.length) * 100) : 100;
  const availability = worker.availability === "AVAILABLE" ? 100 : worker.availability === "PART_TIME" ? 60 : 0;
  const expected = worker.expectedSalary?.max || worker.expectedSalary?.min;
  const offered = job.salary?.max || job.salary?.min;
  const salaryAlignment = !expected || !offered ? 50 : Math.max(20, 100 - Math.round((Math.abs(expected - offered) / expected) * 100));
  const experience = Number(worker.yearsOfExperience || 0) >= Number(job.minExperience || 0) ? 100 : 40;
  const score = Math.round((skillMatch + availability + salaryAlignment + experience + Number(worker.kaushalTrustScore || 0)) / 5);
  return { score, breakdown: { skillMatch, availability, salaryAlignment, experience, trustScore: Number(worker.kaushalTrustScore || 0) } };
};

export const recommendJobsForWorker = async (worker, { limit = 20 } = {}) => {
  const jobs = await Job.find({ status: "OPEN" });
  return jobs.map((job) => ({ job, match: calculateJobMatch(worker, job) })).sort((a, b) => b.match.score - a.match.score).slice(0, Math.min(Number(limit) || 20, 100));
};
