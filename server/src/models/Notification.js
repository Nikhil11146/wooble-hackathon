import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["JOB_MATCH", "APPLICATION_STATUS", "VERIFICATION_COMPLETE", "MESSAGE"], required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    title: { type: String, trim: true },
    message: { type: String, trim: true },
    read: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
