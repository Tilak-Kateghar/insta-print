import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { strictLimiter } from "../middlewares/rateLimit";
import * as jwt from "jsonwebtoken";
import type { SignOptions, Secret } from "jsonwebtoken";
import ms from "ms";
import { authGuard } from "../middlewares/authGuard";
import { parsePagination } from "../utils/pagination";

const router = Router();

/* ================= ENV ================= */

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  process.env.JWT_EXPIRES_IN
    ? (process.env.JWT_EXPIRES_IN as ms.StringValue)
    : "7d";

/* ================= SIGNUP (PUBLIC) ================= */

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
      phone: vendor.phone,
    });
  })
);

/* ================= LOGIN (PUBLIC) ================= */

router.post(
  "/login",
  strictLimiter,
  asyncHandler(async (req, res) => {
    const { phone, password } = req.body;

    if (
      typeof phone !== "string" ||
      phone.trim().length < 10 ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { phone },
    });

    if (!vendor || !vendor.isActive) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, vendor.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: vendor.id, role: "VENDOR" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Login successful",
      vendor: {
        id: vendor.id,
        shopName: vendor.shopName,
        phone: vendor.phone,
      },
    });
  })
);

/* ================= LOGOUT (OPTIONAL AUTH) ================= */

router.post(
  "/logout",
  asyncHandler(async (_req, res) => {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out" });
  })
);

/* ================= PROTECTED EXAMPLE ================= */

router.get(
  "/me",
  authGuard(["VENDOR"]),
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.auth!.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    return res.status(200).json({
      vendor: {
        id: vendor.id,
        shopName: vendor.shopName,
        phone: vendor.phone,
      },
    });
  })
);

router.get(
  "/me/dashboard",
  authGuard(["VENDOR"]),
  asyncHandler(async (req, res) => {
    const vendorId = req.auth!.id;

    const { page, limit, skip } = parsePagination(req.query);

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        shopName: true,
        ownerName: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!vendor || !vendor.isActive) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const jobs = await prisma.printJob.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        completedAt: true,
        status: true,
        copies: true,
        colorMode: true,
        paperSize: true,
        price: true,
        user: {
          select: {
            id: true,
            phone: true,
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

    const earnings = await prisma.vendorEarning.aggregate({
      where: { vendorId },
      _sum: {
        grossAmount: true,
        platformFee: true,
        netAmount: true,
      },
    });

    const unsettled = await prisma.vendorEarning.aggregate({
      where: {
        vendorId,
        settledAt: null,
      },
      _sum: {
        netAmount: true,
      },
    });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const counts = await prisma.printJob.groupBy({
      by: ["status"],
      where: { vendorId },
      _count: { _all: true },
    });

    const lifetimeJobs = await prisma.printJob.count({
      where: { vendorId },
    });

    const timeCounts = async (from: Date) =>
      prisma.printJob.count({
        where: {
          vendorId,
          createdAt: { gte: from },
        },
      });

    return res.status(200).json({
      vendor,
      analytics: {
        jobs: {
          today: await timeCounts(startOfDay),
          week: await timeCounts(startOfWeek),
          month: await timeCounts(startOfMonth),
          year: await timeCounts(startOfYear),
          lifetime: lifetimeJobs,
        },
        earnings: {
          gross: earnings._sum.grossAmount || 0,
          platformFee: earnings._sum.platformFee || 0,
          net: earnings._sum.netAmount || 0,
          pendingSettlement: unsettled._sum.netAmount || 0,
        },
      },
      pagination: {
        page,
        limit,
        returned: jobs.length,
      },
      jobs,
    });
  })
);

export default router;