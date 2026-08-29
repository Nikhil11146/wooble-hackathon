const normalise = (value) => String(value || "").trim().toLowerCase();

export const calculateMatchScore = (worker, job) => {
  const skills = new Set((worker.skills || []).map((skill) => normalise(skill.name || skill.skillId)));
  const required = job.requiredSkills || [];
  const matched = required.filter((skill) => skills.has(normalise(skill.name || skill._id || skill))).length;
  const skillMatch = required.length ? Math.round((matched / required.length) * 100) : 100;
  const availability = worker.availability === "AVAILABLE" ? 100 : worker.availability === "PART_TIME" ? 60 : 0;
  const salary = worker.expectedSalary?.max || worker.expectedSalary?.min;
  const offer = job.salary?.max || job.salary?.min;
  const salaryAlignment = !salary || !offer ? 50 : Math.max(20, 100 - Math.round((Math.abs(salary - offer) / salary) * 100));
  const experience = Number(worker.yearsOfExperience || 0) >= Number(job.minExperience || 0) ? 100 : 40;
  const score = Math.round((skillMatch + availability + salaryAlignment + experience + Number(worker.kaushalTrustScore || 0)) / 5);
  return { score, breakdown: { skillMatch, availability, salaryAlignment, experience, trustScore: Number(worker.kaushalTrustScore || 0) } };
};
