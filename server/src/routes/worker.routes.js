import { Router } from "express";
import {
  addWorkerCertification,
  addWorkerSkill,
  addWorkerWorkHistory,
  applyToJob,
  getJobById,
  getMyProfile,
  getRecommendedJobs,
  getTrustScore,
  getWorkerApplications,
  getWorkerCertifications,
  getWorkerProfile,
  getWorkerSkills,
  getWorkerWorkHistory,
  removeWorkerSkill,
  searchJobs,
  updateWorkerProfile,
  updateWorkerSkill,
} from "../controllers/worker.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateRequiredFields } from "../middleware/validation.middleware.js";

const router = Router();
export const jobRouter = Router();
export const applicationRouter = Router();

router.get("/me", authenticate, authorize("WORKER"), getMyProfile);
router.get("/:id", getWorkerProfile);
router.get("/:id/profile", getWorkerProfile);
router.put("/:id", authenticate, authorize("WORKER"), updateWorkerProfile);
router.put("/:id/profile", authenticate, authorize("WORKER"), updateWorkerProfile);

router.get("/:id/skills", getWorkerSkills);
router.post("/:id/skills", authenticate, authorize("WORKER"), validateRequiredFields(["name"]), addWorkerSkill);
router.put("/:id/skills/:skillId", authenticate, authorize("WORKER"), updateWorkerSkill);
router.delete("/:id/skills/:skillId", authenticate, authorize("WORKER"), removeWorkerSkill);

router.get("/:id/certifications", getWorkerCertifications);
router.post("/:id/certifications", authenticate, authorize("WORKER"), validateRequiredFields(["name", "issuer"]), addWorkerCertification);
router.get("/:id/work-history", getWorkerWorkHistory);
router.post("/:id/work-history", authenticate, authorize("WORKER"), addWorkerWorkHistory);
router.get("/:id/trust-score", getTrustScore);
router.get("/:id/applications", authenticate, authorize("WORKER", "ADMIN"), getWorkerApplications);

jobRouter.get("/recommended", authenticate, authorize("WORKER"), getRecommendedJobs);
jobRouter.get("/search", searchJobs);
jobRouter.get("/:id", getJobById);
applicationRouter.post("/", authenticate, authorize("WORKER"), validateRequiredFields(["jobId"]), applyToJob);

export default router;
