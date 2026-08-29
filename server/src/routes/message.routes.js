import { Router } from "express";
import { createMessage, getConversationWith, getMyInbox, markRead } from "../controllers/message.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequiredFields } from "../middleware/validation.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getMyInbox);
router.get("/with/:userId", getConversationWith);
router.put("/with/:userId/read", markRead);
router.post("/", validateRequiredFields(["recipientId", "content"]), createMessage);

export default router;
