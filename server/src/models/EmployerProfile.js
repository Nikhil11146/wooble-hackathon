import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  { type: { type: String, enum: ["Point"], default: "Point" }, coordinates: { type: [Number], default: undefined } },
  { _id: false },
);

const employerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    companyName: { type: String, required: true, trim: true, index: true },
    phone: { type: String, trim: true },
    industry: String,
    companyLogo: String,
    location: { type: pointSchema, index: "2dsphere" },
    description: String,
    verified: { type: Boolean, default: false },
    numberOfEmployees: { type: Number, min: 0 },
    registrationNumber: { type: String, trim: true, unique: true, sparse: true },
  },
  { timestamps: true },
);

export default mongoose.model("EmployerProfile", employerProfileSchema);
