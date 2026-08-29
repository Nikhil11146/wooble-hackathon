import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    category: { type: String, trim: true, index: true },
    description: String,
    totalWorkers: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }, 
);

export default mongoose.model("Skill", skillSchema);
