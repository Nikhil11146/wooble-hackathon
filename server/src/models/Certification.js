import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    validityYears: { type: Number, min: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Certification", certificationSchema);
