import rateLimit from "express-rate-limit";

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

export const moderateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});