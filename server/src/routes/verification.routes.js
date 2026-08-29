import { Router } from "express";
import {
  getWorkerVerifications,
  requestVerification,
} from "../controllers/verification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateRequiredFields } from "../middleware/validation.middleware.js";
import { isOwnUserId } from "../middleware/ownership.middleware.js";

const router = Router();

router.post(
  "/request",
  authenticate,
  authorize("WORKER"),
  validateRequiredFields(["skillName"]),
  requestVerification,
);
router.get("/:workerId", authenticate, (req, res, next) => {
  if (req.user.role === "WORKER" && !isOwnUserId(req, "workerId")) {
    return res.status(403).json({ success: false, message: "You do not have permission to view these verifications." });
  }
  return next();
}, getWorkerVerifications);

export default router;
