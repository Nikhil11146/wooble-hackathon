import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  { type: { type: String, enum: ["Point"], default: "Point" }, coordinates: { type: [Number], default: undefined } },
  { _id: false },
);
const salarySchema = new mongoose.Schema(
  { min: { type: Number, min: 0 }, max: { type: Number, min: 0 }, currency: { type: String, default: "INR" } },
  { _id: false },
);

const jobSchema = new mongoose.Schema(
  {
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    category: { type: String, trim: true, index: true },
    description: { type: String, default: "" },
    requiredSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
    minExperience: { type: Number, default: 0, min: 0 },
    maxExperience: { type: Number, min: 0 },
    salary: salarySchema,
    location: { type: pointSchema, index: "2dsphere" },
    radius: { type: Number, min: 0 },
    employmentType: { type: String, enum: ["FULL_TIME", "CONTRACT", "TEMPORARY"], default: "FULL_TIME" },
    numberOfPositions: { type: Number, default: 1, min: 1 },
    startDate: Date,
    status: { type: String, enum: ["OPEN", "CLOSED", "FILLED"], default: "OPEN", index: true },
  },
  { timestamps: true },
);

export default mongoose.model("Job", jobSchema);
