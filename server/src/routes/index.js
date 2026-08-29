import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";
import employerRoutes from "./employer.routes.js";
import messageRoutes from "./message.routes.js";
import verificationRoutes from "./verification.routes.js";
import workerRoutes, { applicationRouter, jobRouter } from "./worker.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workers", workerRoutes);
router.use("/employers", employerRoutes);
router.use("/verifications", verificationRoutes);
router.use("/admin", adminRoutes);
router.use("/jobs", jobRouter);
router.use("/applications", applicationRouter);
router.use("/messages", messageRoutes);

export default router;
