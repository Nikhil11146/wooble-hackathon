import { rateLimit } from "express-rate-limit";

const MINUTE = 60 * 1000;

const tooManyRequests = (message) => ({ success: false, message });

// Applied to the whole /api surface to protect against high-volume abuse.
export const apiLimiter = rateLimit({
  windowMs: MINUTE,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooManyRequests("Too many requests. Please try again shortly."),
});

// Stricter window for credential-based endpoints (login, register, refresh).
export const authLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooManyRequests("Too many attempts. Please try again later."),
});