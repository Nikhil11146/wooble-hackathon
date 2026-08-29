import mongoose from "mongoose";
import { ENV } from "../config/env.js";
import { seedApplications } from "./applications.js";
import { seedEmployers } from "./employers.js";
import { seedJobs } from "./jobs.js";
import { seedUsers } from "./users.js";
import { seedWorkers } from "./workers.js";

export const seedDatabase = async () => {
  await mongoose.connect(ENV.MONGODB_URI);
  const users = await seedUsers();
  await Promise.all([seedWorkers(users), seedEmployers(users)]);
  const jobs = await seedJobs(users);
  await seedApplications(users, jobs);
  return { users: Object.keys(users).length, jobs: jobs.length };
};

if (process.argv[1]?.endsWith("seed/index.js")) {
  seedDatabase().then((summary) => console.log("Seed complete:", summary)).catch((error) => { console.error("Seed failed:", error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
}
