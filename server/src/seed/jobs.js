import Job from "../models/Job.js";

export const seedJobs = (users) => Promise.all([
  ["employer@demo.com", "Industrial Electrician", "Electrical", 25000, 35000, 3],
  ["employer2@demo.com", "Residential Plumber", "Plumbing", 20000, 30000, 2],
].map(([email, title, category, min, max, minExperience]) => Job.findOneAndUpdate({ employerId: users[email]._id, title }, { employerId: users[email]._id, title, category, description: `Experienced ${title} required for immediate work.`, minExperience, salary: { min, max, currency: "INR" }, employmentType: "FULL_TIME", numberOfPositions: 2, status: "OPEN" }, { new: true, upsert: true })));
