import User from "../models/User.js";
import { hashPassword } from "../utils/password.js";

export const seedUsers = async () => {
  const password = await hashPassword("Demo123!");
  const definitions = [
    ["admin@demo.com", "ADMIN"], ["worker@demo.com", "WORKER"], ["worker2@demo.com", "WORKER"],
    ["employer@demo.com", "EMPLOYER"], ["employer2@demo.com", "EMPLOYER"],
  ];
  const users = await Promise.all(definitions.map(async ([email, role]) => User.findOneAndUpdate({ email }, { email, password, role, verified: true }, { new: true, upsert: true, setDefaultsOnInsert: true })));
  return Object.fromEntries(users.map((user) => [user.email, user]));
};
