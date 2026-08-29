import { Router } from "express";
import { send, listConversations, listMessages, markRead } from "../controllers/message.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequiredFields } from "../middleware/validation.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/conversations", listConversations);
router.post("/", validateRequiredFields(["recipientId", "content"]), send);
router.get("/:otherUserId", listMessages);
router.post("/:otherUserId/read", markRead);

export default router;