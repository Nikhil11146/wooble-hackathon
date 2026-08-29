import { Router } from "express";
import { login, logout, refresh, register } from "../controllers/auth.controller.js";
import { authLimiter } from "../middleware/rate-limit.middleware.js";
import { validateBody, validateRequiredFields } from "../middleware/validation.middleware.js";
import { registerSchema } from "../utils/validation-schemas.js";

const router = Router();

router.use(authLimiter);

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateRequiredFields(["email", "password"]), login);
router.post("/refresh", validateRequiredFields(["refreshToken"]), refresh);
router.post("/logout", logout);

export default router;
