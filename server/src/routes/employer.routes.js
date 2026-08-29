import { Router } from "express";
import {
  createJob,
  deleteJob,
  getCandidateDetailsById,
  getCandidates,
  getEmployerAnalytics,
  getJobs,
  getMyProfile,
  getPipelineById,
  searchCandidatesById,
  shortlistCandidateById,
  updateEmployerProfileById,
  updateJobById,
  updatePipelineStatus,
} from "../controllers/employer.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { ownEmployerProfile } from "../middleware/ownership.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateRequiredFields } from "../middleware/validation.middleware.js";

const router = Router();
const employerOnly = [authenticate, authorize("EMPLOYER")];
const ownEmployer = [...employerOnly, ownEmployerProfile];

router.get("/me", ...employerOnly, getMyProfile);
router.put("/:id", ...ownEmployer, updateEmployerProfileById);
router.get("/:id/jobs", ...ownEmployer, getJobs);
router.post("/:id/jobs", ...ownEmployer, validateRequiredFields(["title"]), createJob);
router.put("/:id/jobs/:jobId", ...ownEmployer, updateJobById);
router.delete("/:id/jobs/:jobId", ...ownEmployer, deleteJob);

router.get("/:id/candidates/search", ...ownEmployer, searchCandidatesById);
router.get("/:id/candidates/:workerId/details", ...ownEmployer, getCandidateDetailsById);
router.get("/:id/candidates", ...ownEmployer, getCandidates);
router.post("/:id/candidates/:workerId/shortlist", ...ownEmployer, validateRequiredFields(["jobId"]), shortlistCandidateById);

router.get("/:id/pipeline", ...ownEmployer, getPipelineById);
router.put("/:id/pipeline/:appId/status", ...ownEmployer, validateRequiredFields(["status"]), updatePipelineStatus);
router.get("/:id/analytics", ...ownEmployer, getEmployerAnalytics);

export default router;
