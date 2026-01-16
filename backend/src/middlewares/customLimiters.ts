import rateLimit from "express-rate-limit";

export const createLimiter = (
  max: number,
  windowMs: number,
  message: string
) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
  });

export const otpSendLimiter = createLimiter(
  3,
  10 * 60 * 1000,
  "Too many OTP requests. Try later."
);

export const otpVerifyLimiter = createLimiter(
  5,
  10 * 60 * 1000,
  "Too many OTP attempts."
);

export const uploadLimiter = createLimiter(
  10,
  60 * 60 * 1000,
  "Upload limit exceeded."
);

export const pricingLimiter = createLimiter(
  20,
  60 * 60 * 1000,
  "Too many pricing attempts."
);

export const paymentLimiter = createLimiter(
  5,
  60 * 60 * 1000,
  "Too many payment attempts."
);

export const pickupLimiter = createLimiter(
  5,
  60 * 60 * 1000,
  "Too many pickup attempts."
);