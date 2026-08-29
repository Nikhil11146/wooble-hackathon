import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
    skillName: { type: String, required: true, trim: true },
    verificationStatus: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING", index: true },
    verificationType: { type: String, enum: ["SELF_DECLARED", "DOCUMENT", "EMPLOYER", "ASSESSMENT"], default: "DOCUMENT" },
    verifierType: { type: String, enum: ["ADMIN", "EMPLOYER"] },
    verifierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    documentUrl: { type: String, default: "" },
    verifiedAt: Date,
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("Verification", verificationSchema);
