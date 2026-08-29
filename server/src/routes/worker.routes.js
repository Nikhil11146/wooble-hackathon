import { Router } from "express";
import {
  addCertification,
  addSkill,
  addWorkHistory,
  applyToJob,
  getCertifications,
  getJobById,
  getMyProfile,
  getRecommendedJobs,
  getSkills,
  getTrustScore,
  getWorkerApplicationsById,
  getWorkerProfileById,
  getWorkHistory,
  removeSkill,
  searchJobs,
  updateSkill,
  updateWorkerProfileById,
} from "../controllers/worker.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { ownWorkerProfile } from "../middleware/ownership.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateRequiredFields } from "../middleware/validation.middleware.js";

const router = Router();
export const jobRouter = Router();
export const applicationRouter = Router();

const ownWorker = [authenticate, authorize("WORKER"), ownWorkerProfile];

router.get("/me", authenticate, authorize("WORKER"), getMyProfile);
router.get("/:id", getWorkerProfileById);
router.get("/:id/profile", getWorkerProfileById);
router.put("/:id", ...ownWorker, updateWorkerProfileById);
router.put("/:id/profile", ...ownWorker, updateWorkerProfileById);

router.get("/:id/skills", getSkills);
router.post("/:id/skills", ...ownWorker, validateRequiredFields(["name"]), addSkill);
router.put("/:id/skills/:skillId", ...ownWorker, updateSkill);
router.delete("/:id/skills/:skillId", ...ownWorker, removeSkill);

router.get("/:id/certifications", getCertifications);
router.post("/:id/certifications", ...ownWorker, validateRequiredFields(["name", "issuer"]), addCertification);
router.get("/:id/work-history", getWorkHistory);
router.post("/:id/work-history", ...ownWorker, addWorkHistory);
router.get("/:id/trust-score", getTrustScore);
router.get("/:id/applications", authenticate, authorize("WORKER", "ADMIN"), ownWorkerProfile, getWorkerApplicationsById);

jobRouter.get("/recommended", authenticate, authorize("WORKER"), getRecommendedJobs);
jobRouter.get("/search", searchJobs);
jobRouter.get("/:id", getJobById);
applicationRouter.post("/", authenticate, authorize("WORKER"), validateRequiredFields(["jobId"]), applyToJob);

export default router;
