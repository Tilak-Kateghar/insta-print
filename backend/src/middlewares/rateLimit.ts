import rateLimit from "express-rate-limit";

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests
  standardHeaders: true,
  legacyHeaders: false,
});

export const moderateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});