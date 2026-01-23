import rateLimit from "express-rate-limit";
import type { Request } from "express";

const safeKey = (value?: string, prefix = "anon") =>
  value && value.length > 0 ? value : `${prefix}:unknown`;

export const otpSendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: Request): string =>
    safeKey(req.body?.phone, "otp-send"),

  handler: (_req, res) => {
    try {
      res.status(429).json({
        error: "Too many OTP requests. Try later.",
        state: "rate_limited",
      });
    } catch (error) {
      console.error("Error in otpSendLimiter handler:", error);
      res.status(500).json({
        error: "Internal server error",
        state: "error",
      });
    }
  },
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: Request): string =>
    safeKey(req.body?.phone, "otp-verify"),

  handler: (_req, res) => {
    res.status(429).json({
      error: "Too many OTP attempts.",
      state: "rate_limited",
    });
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,

  keyGenerator: (req: Request): string =>
    safeKey(req.auth?.id, "upload"),

  handler: (_req, res) => {
    res.status(429).json({
      error: "Upload limit exceeded.",
      state: "rate_limited",
    });
  },
});

export const pricingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,

  keyGenerator: (req: Request): string =>
    safeKey(`${req.auth?.id}:${req.params?.id}`, "pricing"),

  handler: (_req, res) => {
    res.status(429).json({
      error: "Too many pricing attempts.",
      state: "rate_limited",
    });
  },
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,

  keyGenerator: (req: Request): string =>
    safeKey(`${req.auth?.id}:${req.params?.id}`, "payment"),

  handler: (_req, res) => {
    res.status(429).json({
      error: "Too many payment attempts.",
      state: "rate_limited",
    });
  },
});

export const pickupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,

  keyGenerator: (req: Request): string =>
    safeKey(`${req.auth?.id}:${req.params?.id}`, "pickup"),

  handler: (_req, res) => {
    res.status(429).json({
      error: "Too many pickup attempts.",
      state: "rate_limited",
    });
  },
});

export const vendorForgotOtpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: Request): string =>
    safeKey(req.body?.phone, "vendor-forgot-send"),

  handler: (_req, res) => {
    res.status(429).json({
      error: "Too many reset attempts. Try again later.",
      state: "rate_limited",
    });
  },
});

export const vendorForgotOtpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: Request): string =>
    safeKey(req.body?.phone, "vendor-forgot-verify"),

  handler: (_req, res) => {
    res.status(429).json({
      error: "Too many OTP attempts. Please retry later.",
      state: "rate_limited",
    });
  },
});