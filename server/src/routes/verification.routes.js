import { Router } from "express";
import {
  getWorkerVerifications,
  requestVerification,
} from "../controllers/verification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateRequiredFields } from "../middleware/validation.middleware.js";

const router = Router();

router.post(
  "/request",
  authenticate,
  authorize("WORKER"),
  validateRequiredFields(["workerId", "skillName"]),
  requestVerification,
);
router.get("/:workerId", authenticate, getWorkerVerifications);

export default router;
