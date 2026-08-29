import { Router } from "express";
import { getNotification, listNotifications, markAllRead, markRead } from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listNotifications);
router.get("/:id", getNotification);
router.put("/read-all", markAllRead);
router.put("/:id/read", markRead);

export default router;
