/**
 * Lightweight in-memory fixed-window rate limiter.
 * Suitable for single-process deployments; for multi-instance setups
 * back this with a shared store (e.g. Redis).
 */
const buckets = new Map();

const cleanup = (windowMs) => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart >= windowMs) buckets.delete(key);
  }
};

export const rateLimit = ({ windowMs = 60 * 1000, max = 100, message = "Too many requests, please try again later." } = {}) => {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    cleanup(windowMs);

    let bucket = buckets.get(key);
    if (!bucket || now - bucket.windowStart >= windowMs) {
      bucket = { windowStart: now, count: 0 };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - bucket.count));

    if (bucket.count > max) {
      return res.status(429).json({ success: false, message });
    }
    return next();
  };
};

// Stricter limiter for authentication endpoints (login/register/refresh).
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts, please try again later.",
});
