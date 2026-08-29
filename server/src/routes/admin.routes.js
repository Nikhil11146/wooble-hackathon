import { Router } from "express";
import {
  getAllEmployers,
  getAllJobs,
  getAllUsers,
  getAllWorkers,
  getPlatformAnalytics,
  getPlatformStats,
  updateUserStatus,
} from "../controllers/admin.controller.js";
import {
  approveVerification,
  getPendingVerifications,
  rejectVerification,
} from "../controllers/verification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);
router.get("/workers", getAllWorkers);
router.get("/employers", getAllEmployers);
router.get("/jobs", getAllJobs);
router.get("/analytics", getPlatformAnalytics);
router.get("/platform-stats", getPlatformStats);
router.get("/verifications", getPendingVerifications);
router.put("/verifications/:id/approve", approveVerification);
router.put("/verifications/:id/reject", rejectVerification);

export default router;
