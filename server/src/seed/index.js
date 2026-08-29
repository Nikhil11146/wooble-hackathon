import { connectDatabase, disconnectDatabase } from "../config/database.js";
import "../models/index.js";
import { seedApplications } from "./applications.js";
import { seedEmployers } from "./employers.js";
import { seedJobs } from "./jobs.js";
import { seedMessages } from "./messages.js";
import { seedUsers } from "./users.js";
import { seedWorkers } from "./workers.js";

export const seedDatabase = async () => {
  await connectDatabase();
  const users = await seedUsers();
  await Promise.all([seedWorkers(users), seedEmployers(users)]);
  const jobs = await seedJobs(users);
  await seedApplications(users, jobs);
  const messages = await seedMessages(users, jobs);
  return { users: Object.keys(users).length, jobs: jobs.length, messages };
};

if (process.argv[1]?.split(/[\\/]/).pop() === "index.js") {
  seedDatabase().then((summary) => console.log("Seed complete:", summary)).catch((error) => { console.error("Seed failed:", error.message); process.exitCode = 1; }).finally(disconnectDatabase);
}
