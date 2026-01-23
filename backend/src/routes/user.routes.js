"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const asyncHandler_1 = require("../utils/asyncHandler");
const authGuard_1 = require("../middlewares/authGuard");
const customLimiters_1 = require("../middlewares/customLimiters");
const AppError_1 = require("../utils/AppError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otp_1 = require("../utils/otp");
const logger_1 = require("../lib/logger");
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const isDev = process.env.NODE_ENV !== "production";
if (!JWT_SECRET) {
    throw new AppError_1.AppError("JWT_SECRET not configured", 500, "CONFIG_ERROR");
}
router.post("/send-otp", customLimiters_1.otpSendLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { phone } = req.body;
    if (typeof phone !== "string" || phone.trim().length < 10) {
        throw new AppError_1.AppError("Invalid phone number. Please enter a valid 10-digit phone number.", 400, "VALIDATION_ERROR");
    }
    const otp = (0, otp_1.generateOtp)();
    const otpHash = (0, otp_1.hashOtp)(phone, otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await prisma_1.default.userOtp.deleteMany({ where: { phone } });
    await prisma_1.default.userOtp.create({
        data: { phone, otpHash, expiresAt },
    });
    if (isDev) {
        logger_1.logger.debug({ phone }, "USER_OTP_GENERATED");
        // eslint-disable-next-line no-console
        console.log(`\n🔐 DEV OTP for ${phone}: ${otp}\n`);
    }
    return res.status(200).json({
        message: "OTP generated",
        ...(isDev && { otp }),
    });
}));
router.post("/verify-otp", customLimiters_1.otpVerifyLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        throw new AppError_1.AppError("Phone and OTP are required", 400, "VALIDATION_ERROR");
    }
    if (isDev) {
        // eslint-disable-next-line no-console
        console.log(`OTP verification attempt: ${otp}`);
    }
    if (typeof phone !== "string" || typeof otp !== "string") {
        throw new AppError_1.AppError("Invalid input format", 400, "VALIDATION_ERROR");
    }
    const record = await prisma_1.default.userOtp.findUnique({ where: { phone } });
    if (!record) {
        throw new AppError_1.AppError("OTP not found or expired. Please request a new OTP.", 400, "OTP_NOT_FOUND");
    }
    if (record.expiresAt < new Date()) {
        await prisma_1.default.userOtp.delete({ where: { phone } }).catch(() => { });
        throw new AppError_1.AppError("OTP has expired. Please request a new OTP.", 400, "OTP_EXPIRED");
    }
    if ((0, otp_1.hashOtp)(phone, otp) !== record.otpHash) {
        throw new AppError_1.AppError("Invalid OTP. Please try again.", 400, "INVALID_OTP");
    }
    let user = await prisma_1.default.user.findUnique({ where: { phone } });
    if (!user) {
        user = await prisma_1.default.user.create({
            data: { phone, isVerified: true },
        });
    }
    else if (!user.isVerified) {
        await prisma_1.default.user.update({
            where: { phone },
            data: { isVerified: true },
        });
    }
    await prisma_1.default.userOtp.delete({ where: { phone } }).catch(() => { });
    const token = jsonwebtoken_1.default.sign({ sub: user.id, role: "USER" }, JWT_SECRET, { expiresIn: "7d" });
    const cookieOptions = {
        httpOnly: true,
        secure: !isDev,
        sameSite: isDev ? "lax" : "strict",
    };
    res.cookie("access_token", token, cookieOptions);
    res.cookie("role", "USER", { ...cookieOptions, httpOnly: false });
    return res.json({
        message: "OTP verified",
        user: { id: user.id, phone: user.phone },
    });
}));
router.get("/me/dashboard", (0, authGuard_1.authGuard)(["USER"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.auth?.id;
    if (!userId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, phone: true, createdAt: true },
    });
    if (!user) {
        throw new AppError_1.AppError("User not found", 404, "NOT_FOUND");
    }
    const jobs = await prisma_1.default.printJob.findMany({
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
}));
router.post("/logout", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: !isDev,
        sameSite: isDev ? "lax" : "strict",
    };
    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("role", {
        httpOnly: false,
        secure: !isDev,
        sameSite: (isDev ? "lax" : "strict"),
    });
    return res.status(200).json({ message: "Logged out" });
}));
exports.default = router;