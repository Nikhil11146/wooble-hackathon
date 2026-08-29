import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  { type: { type: String, enum: ["Point"], default: "Point" }, coordinates: { type: [Number], default: undefined } },
  { _id: false },
);
const salarySchema = new mongoose.Schema(
  { min: { type: Number, min: 0 }, max: { type: Number, min: 0 }, currency: { type: String, default: "INR" } },
  { _id: false },
);
const skillSchema = new mongoose.Schema(
  {
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
    name: { type: String, required: true, trim: true },
    verificationStatus: { type: String, enum: ["SELF_DECLARED", "PENDING", "APPROVED", "REJECTED"], default: "SELF_DECLARED" },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);
const certificationSchema = new mongoose.Schema(
  {
    certId: { type: mongoose.Schema.Types.ObjectId, ref: "Certification" },
    name: { type: String, required: true, trim: true },
    issuer: { type: String, trim: true },
    issueDate: Date,
    expiryDate: Date,
    documentUrl: String,
    verified: { type: Boolean, default: false },
  },
  { _id: true },
);
const workHistorySchema = new mongoose.Schema(
  { companyName: String, role: String, description: String, startDate: Date, endDate: Date, currentlyWorking: Boolean },
  { _id: true },
);

const workerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    location: { type: pointSchema, index: "2dsphere" },
    profilePhoto: String,
    headline: String,
    bio: String,
    yearsOfExperience: { type: Number, default: 0, min: 0 },
    primaryOccupation: { type: String, trim: true, index: true },
    languages: { type: [String], default: [] },
    expectedSalary: salarySchema,
    availability: { type: String, enum: ["AVAILABLE", "UNAVAILABLE", "PART_TIME"], default: "AVAILABLE" },
    workHistory: { type: [workHistorySchema], default: [] },
    skills: { type: [skillSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    kaushalTrustScore: { type: Number, default: 0, min: 0, max: 100 },
    trustScoreBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],
    completedJobsCount: { type: Number, default: 0, min: 0 },
    assessmentPassed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("WorkerProfile", workerProfileSchema);
