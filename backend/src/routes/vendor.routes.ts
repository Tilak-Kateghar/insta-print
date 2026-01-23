import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { strictLimiter } from "../middlewares/rateLimit";
import jwt from "jsonwebtoken";
import ms from "ms";
import { authGuard } from "../middlewares/authGuard";
import { generateOtp, hashOtp } from "../utils/otp";
import { AppError } from "../utils/AppError";
import {
  vendorForgotOtpSendLimiter,
  vendorForgotOtpVerifyLimiter,
} from "../middlewares/customLimiters";
import { logger } from "../lib/logger";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new AppError("JWT_SECRET not configured", 500, "CONFIG_ERROR");
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN
  ? (process.env.JWT_EXPIRES_IN as ms.StringValue)
  : "7d";

router.post(
  "/signup",
  strictLimiter,
  asyncHandler(async (req, res) => {
    const { shopName, ownerName, phone, password } = req.body;

    if (!shopName || !ownerName || !phone || !password) {
      throw new AppError("Missing required fields: shopName, ownerName, phone, password", 400, "VALIDATION_ERROR");
    }

    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400, "VALIDATION_ERROR");
    }

    const existingVendor = await prisma.vendor.findUnique({
      where: { phone },
    });

    if (existingVendor) {
      throw new AppError("Vendor with this phone number already exists", 409, "DUPLICATE_ENTRY");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const vendor = await prisma.vendor.create({
      data: {
        shopName,
        ownerName,
        phone,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      id: vendor.id,
      shopName: vendor.shopName,
      ownerName: vendor.ownerName,
      phone: vendor.phone,
    });
  })
);

router.post(
  "/login",
  strictLimiter,
  asyncHandler(async (req, res) => {
    const phone = String(req.body.phone || "").trim();
    const password = String(req.body.password || "");

    if (phone.length < 10) {
      throw new AppError("Invalid phone number", 400, "VALIDATION_ERROR");
    }

    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400, "VALIDATION_ERROR");
    }

    const vendor = await prisma.vendor.findUnique({ where: { phone } });
    if (!vendor) {
      throw new AppError("Invalid credentials", 401, "AUTH_ERROR");
    }

    if (!vendor.isActive) {
      throw new AppError("Account is deactivated. Please contact support.", 403, "ACCOUNT_INACTIVE");
    }

    const ok = await bcrypt.compare(password, vendor.password);
    if (!ok) {
      throw new AppError("Invalid credentials", 401, "AUTH_ERROR");
    }

    const token = jwt.sign(
      { sub: vendor.id, role: "VENDOR" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: (process.env.NODE_ENV === "production" ? "strict" : "lax") as "strict" | "lax",
    };

    res.cookie("access_token", token, cookieOptions);
    res.cookie("role", "VENDOR", { ...cookieOptions, httpOnly: false });

    res.json({
      message: "Login successful",
      vendor: {
        id: vendor.id,
        shopName: vendor.shopName,
        phone: vendor.phone,
      },
    });
  })
);

router.post(
  "/forgot-password",
  vendorForgotOtpSendLimiter,
  asyncHandler(async (req, res) => {
    const phone = String(req.body.phone || "").trim();
    
    if (!phone || phone.length < 10) {
      throw new AppError("Valid phone number is required", 400, "VALIDATION_ERROR");
    }

    const vendor = await prisma.vendor.findUnique({ where: { phone } });

    // Don't reveal whether account exists
    if (!vendor) {
      return res.json({ message: "If account exists, OTP sent" });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(phone, otp);

    await prisma.vendorPasswordReset.deleteMany({ where: { phone } });

    await prisma.vendorPasswordReset.create({
      data: {
        phone,
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    const isDev = process.env.NODE_ENV !== "production";

    if (isDev) {
      logger.debug({ phone }, "VENDOR_FORGOT_PASSWORD_OTP");
      // eslint-disable-next-line no-console
      console.log(
        "\n================ VENDOR FORGOT PASSWORD OTP ================\n" +
        `📱 Phone : ${phone}\n` +
        `🔐 OTP   : ${otp}\n` +
        "===========================================================\n"
      );
    }

    return res.json({
      message: "OTP sent",
      ...(isDev && { otp }),
    });
  })
);

router.post(
  "/verify-forgot-otp",
  vendorForgotOtpVerifyLimiter,
  asyncHandler(async (req, res) => {
    const phone = String(req.body.phone || "").trim();
    const otp = String(req.body.otp || "");

    if (!phone || !otp) {
      throw new AppError("Phone and OTP are required", 400, "VALIDATION_ERROR");
    }

    if (otp.length !== 6) {
      throw new AppError("OTP must be 6 digits", 400, "VALIDATION_ERROR");
    }

    const record = await prisma.vendorPasswordReset.findUnique({
      where: { phone },
    });

    if (!record) {
      throw new AppError("OTP not found or expired. Please request a new OTP.", 400, "OTP_NOT_FOUND");
    }

    if (record.expiresAt < new Date()) {
      await prisma.vendorPasswordReset.delete({ where: { phone } }).catch(() => {});
      throw new AppError("OTP has expired. Please request a new OTP.", 400, "OTP_EXPIRED");
    }

    if (hashOtp(phone, otp) !== record.otpHash) {
      throw new AppError("Invalid OTP. Please try again.", 400, "INVALID_OTP");
    }

    res.json({ message: "OTP verified" });
  })
);

router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const phone = String(req.body.phone || "").trim();
    const otp = String(req.body.otp || "");
    const newPassword = String(req.body.newPassword || "");

    if (!phone || !otp) {
      throw new AppError("Phone and OTP are required", 400, "VALIDATION_ERROR");
    }

    if (newPassword.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400, "VALIDATION_ERROR");
    }

    const record = await prisma.vendorPasswordReset.findUnique({
      where: { phone },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new AppError("OTP expired or invalid. Please start over.", 400, "OTP_INVALID");
    }

    if (hashOtp(phone, otp) !== record.otpHash) {
      throw new AppError("Invalid OTP", 400, "INVALID_OTP");
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    try {
      await prisma.$transaction([
        prisma.vendor.update({
          where: { phone },
          data: { password: hashed },
        }),
        prisma.vendorPasswordReset.delete({
          where: { phone },
        }),
      ]);
    } catch (error) {
      logger.error({ error, phone }, "PASSWORD_RESET_FAILED");
      throw new AppError("Failed to reset password. Please try again.", 500, "RESET_FAILED");
    }

    res.json({ message: "Password reset successful" });
  })
);

router.post(
  "/logout",
  asyncHandler(async (_req, res) => {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: (process.env.NODE_ENV === "production" ? "strict" : "lax") as "strict" | "lax",
    };

    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("role", { ...cookieOptions, httpOnly: false });
    res.json({ message: "Logged out" });
  })
);

router.get(
  "/public",
  asyncHandler(async (_req, res) => {
    const vendors = await prisma.vendor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        shopName: true,
      },
      orderBy: {
        shopName: "asc",
      },
    });

    return res.status(200).json({ vendors });
  })
);

router.get(
  "/me/dashboard",
  authGuard(["VENDOR"]),
  asyncHandler(async (req, res) => {
    const vendorId = req.auth?.id;
    if (!vendorId) {
      throw new AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    res.json({ ok: true, vendorId });
  })
);

export default router;