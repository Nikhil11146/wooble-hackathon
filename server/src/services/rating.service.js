import Rating from "../models/Rating.js";
import WorkerProfile from "../models/WorkerProfile.js";

const serviceError = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const RATING_CATEGORIES = ["PROFESSIONALISM", "QUALITY", "PUNCTUALITY", "COMMUNICATION"];

export const submitRating = async ({ workerId, jobId, rating, feedback, category }, employerId) => {
  if (!workerId || !jobId || !rating || !category) throw serviceError("workerId, jobId, rating, and category are required.", 400);
  if (!RATING_CATEGORIES.includes(category)) throw serviceError("Invalid rating category.", 400);
  const value = Number(rating);
  if (Number.isNaN(value) || value < 1 || value > 5) throw serviceError("Rating must be between 1 and 5.", 400);

  let record = await Rating.findOne({ workerId, jobId, category });
  if (record) {
    record.rating = value;
    record.feedback = feedback ?? record.feedback;
    record.employerId = employerId;
    await record.save();
  } else {
    record = await Rating.create({ workerId, jobId, employerId, rating: value, feedback, category });
  }
  return record;
};

export const getWorkerRatings = (workerId) =>
  Rating.find({ workerId }).populate("employerId", "email").sort({ createdAt: -1 });

export const hasRatedJob = (employerId, jobId, category) =>
  Rating.exists({ employerId, jobId, category });
