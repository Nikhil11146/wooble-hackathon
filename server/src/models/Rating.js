import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, default: "" },
    category: { type: String, enum: ["PROFESSIONALISM", "QUALITY", "PUNCTUALITY", "COMMUNICATION"], required: true },
  },
  { timestamps: true },
);

ratingSchema.index({ workerId: 1, jobId: 1, category: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);
