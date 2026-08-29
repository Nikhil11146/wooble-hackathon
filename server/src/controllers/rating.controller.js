import { getWorkerRatings, submitRating } from "../services/rating.service.js";

const sendError = (res, error) => res.status(error.statusCode || 500).json({ success: false, message: error.message });

// POST /api/ratings
export const createRating = async (req, res) => {
  try {
    const rating = await submitRating(req.body, req.user.id);
    return res.status(201).json({ success: true, message: "Rating submitted successfully.", data: rating });
  } catch (error) { return sendError(res, error); }
};

// GET /api/ratings/worker/:workerId
export const getRatingsForWorker = async (req, res) => {
  try {
    const ratings = await getWorkerRatings(req.params.workerId);
    return res.status(200).json({ success: true, data: ratings });
  } catch (error) { return sendError(res, error); }
};
