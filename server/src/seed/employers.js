import EmployerProfile from "../models/EmployerProfile.js";

export const seedEmployers = (users) => Promise.all([
  ["employer@demo.com", "BuildRight Contractors", "Construction", "REG-2026-001"],
  ["employer2@demo.com", "CityFix Services", "Home Services", "REG-2026-002"],
].map(([email, companyName, industry, registrationNumber]) => EmployerProfile.findOneAndUpdate({ userId: users[email]._id }, { userId: users[email]._id, companyName, industry, registrationNumber, verified: true, numberOfEmployees: 45 }, { new: true, upsert: true })));
