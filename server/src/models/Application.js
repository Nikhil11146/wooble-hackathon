import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["APPLIED", "SHORTLISTED", "INTERVIEW", "REJECTED", "HIRED"], default: "APPLIED", index: true },
    matchScore: { type: Number, min: 0, max: 100 },
    appliedAt: { type: Date, default: Date.now },
    movedToInterviewAt: Date,
    hiredAt: Date,
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

applicationSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
