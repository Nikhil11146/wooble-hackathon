import { Router } from "express";
import { createRating, getRatingsForWorker } from "../controllers/rating.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateRequiredFields } from "../middleware/validation.middleware.js";

const router = Router();

router.post("/", authenticate, authorize("EMPLOYER"), validateRequiredFields(["workerId", "jobId", "rating", "category"]), createRating);
router.get("/worker/:workerId", getRatingsForWorker);

export default router;
