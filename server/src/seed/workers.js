import WorkerProfile from "../models/WorkerProfile.js";
import { calculateTrustScore } from "../utils/trust-score-algo.js";

export const seedWorkers = async (users) => {
  const data = [
    { email: "worker@demo.com", name: "Ravi Kumar", phone: "9876543210", occupation: "Electrician", experience: 5, availability: "AVAILABLE", skills: ["Electrical Wiring", "Safety", "Maintenance"] },
    { email: "worker2@demo.com", name: "Sita Devi", phone: "9876543211", occupation: "Plumber", experience: 3, availability: "PART_TIME", skills: ["Plumbing", "Pipe Fitting", "Safety"] },
  ];
  return Promise.all(data.map(async (item) => {
    const profile = { userId: users[item.email]._id, name: item.name, phone: item.phone, primaryOccupation: item.occupation, yearsOfExperience: item.experience, availability: item.availability, languages: ["Hindi", "English"], expectedSalary: { min: 18000, max: 30000, currency: "INR" }, skills: item.skills.map((name, index) => ({ name, verified: index < 2, verificationStatus: index < 2 ? "APPROVED" : "SELF_DECLARED" })) };
    const score = calculateTrustScore(profile);
    return WorkerProfile.findOneAndUpdate({ userId: profile.userId }, { ...profile, kaushalTrustScore: score.total, trustScoreBreakdown: score.breakdown }, { new: true, upsert: true });
  }));
};
