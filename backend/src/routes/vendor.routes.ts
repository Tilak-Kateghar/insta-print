import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { strictLimiter } from "../middlewares/rateLimit";
import jwt from "jsonwebtoken";
import ms from "ms";
import { authGuard } from "../middlewares/authGuard";
import { parsePagination } from "../utils/pagination";
import { generateOtp, hashOtp } from "../utils/otp";
import { AppError } from "../utils/AppError";
import {
  vendorForgotOtpSendLimiter,
  vendorForgotOtpVerifyLimiter,
} from "../middlewares/customLimiters";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN
  ? (process.env.JWT_EXPIRES_IN as ms.StringValue)
  : "7d";

router.post(
  "/signup",
  strictLimiter,
  asyncHandler(async (req, res) => {
    const { shopName, ownerName, phone, password } = req.body;

    if (!shopName || !ownerName || !phone || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingVendor = await prisma.vendor.findUnique({
      where: { phone },
    });

    if (existingVendor) {
      return res.status(409).json({ error: "Vendor already exists" });
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

    if (phone.length < 10 || password.length < 8) {
      throw new AppError("Invalid credentials", 400);
    }

    const vendor = await prisma.vendor.findUnique({ where: { phone } });
    if (!vendor || !vendor.isActive) {
      throw new AppError("Invalid credentials", 401);
    }

    const ok = await bcrypt.compare(password, vendor.password);
    if (!ok) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = jwt.sign(
      { sub: vendor.id, role: "VENDOR" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    res.cookie("role", "VENDOR", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

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
    if (!phone) throw new AppError("Phone required", 400);

    const vendor = await prisma.vendor.findUnique({ where: { phone } });

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
      console.log(
        "\n================ VENDOR FORGOT PASSWORD OTP ================\n" +
        `📱 Phone : ${phone}\n` +
        `🔐 OTP   : ${otp}\n` +
        "===========================================================\n"
      );
    }

    return res.json({
      message: "OTP sent",
      ...(process.env.NODE_ENV !== "production" && { otp }),
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
      throw new AppError("Phone and OTP required", 400);
    }

    const record = await prisma.vendorPasswordReset.findUnique({
      where: { phone },
    });

    if (!record) throw new AppError("OTP not found", 400);
    if (record.expiresAt < new Date()) {
      await prisma.vendorPasswordReset.delete({ where: { phone } });
      throw new AppError("OTP expired", 400);
    }

    if (hashOtp(phone, otp) !== record.otpHash) {
      throw new AppError("Invalid OTP", 400);
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

    if (!phone || !otp || newPassword.length < 8) {
      throw new AppError("Invalid request", 400);
    }

    const record = await prisma.vendorPasswordReset.findUnique({
      where: { phone },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new AppError("OTP expired", 400);
    }

    if (hashOtp(phone, otp) !== record.otpHash) {
      throw new AppError("Invalid OTP", 400);
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.vendor.update({
        where: { phone },
        data: { password: hashed },
      }),
      prisma.vendorPasswordReset.delete({
        where: { phone },
      }),
    ]);

    res.json({ message: "Password reset successful" });
  })
);

router.post(
  "/logout",
  asyncHandler(async (_req, res) => {
    res.clearCookie("access_token");
    res.clearCookie("role");
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
    res.json({ ok: true });
  })
);

export default router;