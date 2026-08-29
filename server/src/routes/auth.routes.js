import { Router } from "express";
import { login, logout, refresh, register } from "../controllers/auth.controller.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";
import { validateRequiredFields } from "../middleware/validation.middleware.js";

const router = Router();

router.post("/register", authRateLimiter, validateRequiredFields(["email", "password", "role"]), register);
router.post("/login", authRateLimiter, validateRequiredFields(["email", "password"]), login);
router.post("/refresh", authRateLimiter, validateRequiredFields(["refreshToken"]), refresh);
router.post("/logout", authRateLimiter, logout);

export default router;
