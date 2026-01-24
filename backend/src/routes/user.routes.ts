import express, { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { authGuard } from "../middlewares/authGuard";
import { otpSendLimiter, otpVerifyLimiter } from "../middlewares/customLimiters";
import { AppError } from "../utils/AppError";
import jwt from "jsonwebtoken";
import { generateOtp, hashOtp } from "../utils/otp";
import { logger } from "../lib/logger";
import { getAuthCookieOptions } from "../utils/cookies";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const showDevOtp = process.env.SHOW_DEV_OTP === "true";

if (!JWT_SECRET) {
  throw new AppError("JWT_SECRET not configured", 500, "CONFIG_ERROR");
}

router.post(
  "/send-otp",
  otpSendLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;

    if (typeof phone !== "string" || phone.trim().length < 10) {
      throw new AppError("Invalid phone number. Please enter a valid 10-digit phone number.", 400, "VALIDATION_ERROR");
    }

    const otp = generateOtp();
    const otpHash = hashOtp(phone, otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.userOtp.deleteMany({ where: { phone } });

    await prisma.userOtp.create({
      data: { phone, otpHash, expiresAt },
    });

    console.log(`\n🔐 DEV OTP for ${phone}: ${otp}\n`);

    return res.status(200).json({
      success: true,
      message: "OTP generated",
      ...(showDevOtp && { otp }),
    });
  })
);

router.post(
  "/verify-otp",
  otpVerifyLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      throw new AppError("Phone and OTP are required", 400, "VALIDATION_ERROR");
    }

    console.log(`OTP verification attempt: ${otp}`);


    if (typeof phone !== "string" || typeof otp !== "string") {
      throw new AppError("Invalid input format", 400, "VALIDATION_ERROR");
    }

    const record = await prisma.userOtp.findUnique({ where: { phone } });

    if (!record) {
      throw new AppError("OTP not found or expired. Please request a new OTP.", 400, "OTP_NOT_FOUND");
    }
    
    if (record.expiresAt < new Date()) {
      await prisma.userOtp.delete({ where: { phone } }).catch(() => {});
      throw new AppError("OTP has expired. Please request a new OTP.", 400, "OTP_EXPIRED");
    }

    if (hashOtp(phone, otp) !== record.otpHash) {
      throw new AppError("Invalid OTP. Please try again.", 400, "INVALID_OTP");
    }

    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: { phone, isVerified: true },
      });
    } else if (!user.isVerified) {
      await prisma.user.update({
        where: { phone },
        data: { isVerified: true },
      });
    }

    await prisma.userOtp.delete({ where: { phone } }).catch(() => {});

    const token = jwt.sign(
      { sub: user.id, role: "USER" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("access_token", token, getAuthCookieOptions());
    res.cookie("role", "USER", {
      ...getAuthCookieOptions(),
      httpOnly: false,
    });

    return res.json({
      message: "OTP verified",
      user: { id: user.id, phone: user.phone },
      success: true,
      role: "USER",
    });
  })
);

router.get(
  "/me",
  authGuard(["USER"]),
  asyncHandler(async (req, res) => {
    res.json({ ok: true, userId: req.auth!.id });
  })
);

router.get(
  "/me/dashboard",
  authGuard(["USER"]),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth?.id;
    
    if (!userId) {
      throw new AppError("Unauthorized", 401, "AUTH_ERROR");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phone: true, createdAt: true },
    });

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    const jobs = await prisma.printJob.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        price: true,
        createdAt: true,
        vendor: { select: { shopName: true, ownerName: true } },
      },
    });

    return res.status(200).json({
      user,
      summary: {
        totalJobs: jobs.length,
        completedJobs: jobs.filter((j: typeof jobs[0]) => j.status === "COMPLETED").length,
        cancelledJobs: jobs.filter((j: typeof jobs[0]) => j.status === "CANCELLED").length,
        pendingJobs: jobs.filter((j: typeof jobs[0]) => j.status === "PENDING").length,
        totalSpent: jobs.reduce((s: number, j: typeof jobs[0]) => s + (j.price ?? 0), 0),
      },
      jobs,
    });
  })
);

router.post(
  "/logout",
  asyncHandler(async (_req: Request, res: Response) => {
    const opts = getAuthCookieOptions();
    
    res.clearCookie("access_token", opts);
    res.clearCookie("role", { ...opts, httpOnly: false });

    return res.json({ success: true, message: "Logged out" });
  })
);

export default router;