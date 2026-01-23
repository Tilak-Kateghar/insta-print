import express from "express";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { authGuard } from "../middlewares/authGuard";
import { otpSendLimiter, otpVerifyLimiter } from "../middlewares/customLimiters";
import { AppError } from "../utils/AppError";
import jwt from "jsonwebtoken";
import { generateOtp, hashOtp } from "../utils/otp";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const isDev = process.env.NODE_ENV !== "production";

router.post(
  "/send-otp",
  otpSendLimiter,
  asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (typeof phone !== "string" || phone.trim().length < 10) {
      throw new AppError("Invalid phone number", 400);
    }

    const otp = generateOtp();
    const otpHash = hashOtp(phone, otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.userOtp.deleteMany({ where: { phone } });

    await prisma.userOtp.create({
      data: { phone, otpHash, expiresAt },
    });

    if (isDev) {
      console.log(`\n🔐 DEV OTP for ${phone}: ${otp}\n`);
    }

    console.log(`${otp}`);

    return res.status(200).json({
      message: "OTP generated",
      ...(isDev && { otp }),
    });
  })
);

router.post(
  "/verify-otp",
  otpVerifyLimiter,
  asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;

    console.log(`${otp}`);

    if (!phone || !otp) {
      throw new AppError("Phone and OTP required", 400);
    }

    const record = await prisma.userOtp.findUnique({ where: { phone } });

    if (!record) throw new AppError("OTP not found", 400);
    if (record.expiresAt < new Date()) {
      await prisma.userOtp.delete({ where: { phone } });
      throw new AppError("OTP expired", 400);
    }

    if (hashOtp(phone, otp) !== record.otpHash) {
      throw new AppError("Invalid OTP", 400);
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

    await prisma.userOtp.delete({ where: { phone } });

    const token = jwt.sign(
      { sub: user.id, role: "USER" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: !isDev,
      sameSite: isDev ? "lax" : "strict",
    });

    res.cookie("role", "USER", {
      httpOnly: false,
      secure: !isDev,
      sameSite: isDev ? "lax" : "strict",
    });

    return res.json({
      message: "OTP verified",
      user: { id: user.id, phone: user.phone },
    });
  })
);

router.get(
  "/me/dashboard",
  authGuard(["USER"]),
  asyncHandler(async (req, res) => {
    const userId = req.auth!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phone: true, createdAt: true },
    });

    if (!user) return res.status(401).json({ error: "Unauthorized" });

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
        completedJobs: jobs.filter(j => j.status === "COMPLETED").length,
        cancelledJobs: jobs.filter(j => j.status === "CANCELLED").length,
        pendingJobs: jobs.filter(j => j.status === "PENDING").length,
        totalSpent: jobs.reduce((s, j) => s + (j.price ?? 0), 0),
      },
      jobs,
    });
  })
);

router.post(
  "/logout",
  asyncHandler(async (_req, res) => {
    const cookieOptions = {
      httpOnly: true,
      secure: !isDev,
      sameSite: isDev ? "lax" : "strict",
    } as const;

    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("role", {
      httpOnly: false,
      secure: !isDev,
      sameSite: isDev ? "lax" : "strict",
    });

    return res.status(200).json({ message: "Logged out" });
  })
);

export default router;