import express from "express";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { authGuard } from "../middlewares/authGuard";
import { otpSendLimiter } from "../middlewares/customLimiters";
import { otpVerifyLimiter } from "../middlewares/customLimiters";
import { AppError } from "../utils/AppError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";

const router = express.Router();

// helper to generate 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// send otp
router.post(
  "/send-otp",
  otpSendLimiter,
  asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (typeof phone !== "string" || phone.trim().length < 10) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const otpHash = await bcrypt.hash(otp, 10);

    // delete existing OTP for this phone (enforce one active OTP)
    await prisma.userOtp.deleteMany({
      where: { phone },
    });

    // store new OTP
    await prisma.userOtp.upsert({
      where: { phone },
      update: {
        otpHash,
        expiresAt,
        attempts: 0,
      },
      create: {
        phone,
        otpHash,
        expiresAt,
      },
    });

    // DEV ONLY: log OTP
    if (process.env.NODE_ENV !== "production") {
      console.log(`📲 OTP for ${phone}: ${otp}`);
    }

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  })
);

// verify otp
router.post(
  "/verify-otp",
  otpVerifyLimiter,
  asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;

    if (typeof phone !== "string" || phone.trim().length < 10) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    if (typeof otp !== "string" || otp.length !== 6) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const record = await prisma.userOtp.findUnique({
      where: { phone },
    });

    if (!record) {
      return res.status(400).json({ error: "OTP not found" });
    }

    if (record.expiresAt < new Date()) {
      await prisma.userOtp.delete({ where: { id: record.id } });
      return res.status(400).json({ error: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);

    if (!isValid) {
      throw new AppError("Invalid OTP", 400);
    }

    // find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          isVerified: true,
        },
      });
    } else if (!user.isVerified) {
      user = await prisma.user.update({
        where: { phone },
        data: { isVerified: true },
      });
    }

    // delete OTP after successful verification
    await prisma.userOtp.delete({
      where: { id: record.id },
    });

    // ✅ ISSUE JWT (THIS IS THE LOGIN MOMENT)
    const token = jwt.sign(
      {
        sub: user.id,
        role: "USER", // ← THIS IS THE SOURCE OF TRUTH
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // ✅ SET COOKIE
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // ✅ RESPONSE
    return res.status(200).json({
      message: "OTP verified successfully",
      user: {
        id: user.id,
        phone: user.phone,
      },
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
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const jobs = await prisma.printJob.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileUrl: true,
        copies: true,
        colorMode: true,
        paperSize: true,
        price: true,
        status: true,
        createdAt: true,
        completedAt: true,
        vendor: {
          select: {
            id: true,
            shopName: true,
          },
        },
        payment: {
          select: {
            status: true,
            method: true,
          },
        },
      },
    });

    const totals = jobs.reduce(
      (acc, j) => {
        acc.totalJobs++;
        if (j.status === "COMPLETED") acc.completed++;
        if (j.status === "CANCELLED") acc.cancelled++;
        if (j.price) acc.totalSpent += j.price;
        return acc;
      },
      {
        totalJobs: 0,
        completed: 0,
        cancelled: 0,
        totalSpent: 0,
      }
    );

    return res.status(200).json({
      user,
      summary: {
        totalJobs: totals.totalJobs,
        completedJobs: totals.completed,
        cancelledJobs: totals.cancelled,
        pendingJobs:
          totals.totalJobs - totals.completed - totals.cancelled,
        totalSpent: totals.totalSpent,
      },
      jobs,
    });
  })
);

export default router;