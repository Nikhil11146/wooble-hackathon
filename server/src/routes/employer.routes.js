import { Router } from "express";
import {
  createJob,
  deleteJob,
  getAllCandidates,
  getCandidateDetails,
  getEmployerAnalytics,
  getEmployerJobs,
  getMyProfile,
  getPipeline,
  searchCandidates,
  shortlistCandidate,
  updateEmployerProfile,
  updateJob,
  updatePipelineStatus,
} from "../controllers/employer.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateRequiredFields } from "../middleware/validation.middleware.js";

const router = Router();
const employerOnly = [authenticate, authorize("EMPLOYER")];

router.get("/me", ...employerOnly, getMyProfile);
router.put("/:id", ...employerOnly, updateEmployerProfile);
router.get("/:id/jobs", ...employerOnly, getEmployerJobs);
router.post("/:id/jobs", ...employerOnly, validateRequiredFields(["title"]), createJob);
router.put("/:id/jobs/:jobId", ...employerOnly, updateJob);
router.delete("/:id/jobs/:jobId", ...employerOnly, deleteJob);

router.get("/:id/candidates/search", ...employerOnly, searchCandidates);
router.get("/:id/candidates/:workerId/details", ...employerOnly, getCandidateDetails);
router.get("/:id/candidates", ...employerOnly, getAllCandidates);
router.post("/:id/candidates/:workerId/shortlist", ...employerOnly, validateRequiredFields(["jobId"]), shortlistCandidate);

router.get("/:id/pipeline", ...employerOnly, getPipeline);
router.put("/:id/pipeline/:appId/status", ...employerOnly, validateRequiredFields(["status"]), updatePipelineStatus);
router.get("/:id/analytics", ...employerOnly, getEmployerAnalytics);

export default router;
