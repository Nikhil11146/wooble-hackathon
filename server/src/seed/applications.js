import Application from "../models/Application.js";

export const seedApplications = (users, jobs) => Promise.all([
  [jobs[0], users["worker@demo.com"], "SHORTLISTED"],
  [jobs[1], users["worker2@demo.com"], "APPLIED"],
].map(([job, worker, status]) => Application.findOneAndUpdate({ jobId: job._id, workerId: worker._id }, { jobId: job._id, workerId: worker._id, status, matchScore: status === "SHORTLISTED" ? 88 : 74, appliedAt: new Date() }, { new: true, upsert: true })));
