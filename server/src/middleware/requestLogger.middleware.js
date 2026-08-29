import { logger } from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  if ((process.env.NODE_ENV || "development") === "test") return next();

  const startedAt = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    logger.info("HTTP request", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip,
    });
  });
  return next();
};
