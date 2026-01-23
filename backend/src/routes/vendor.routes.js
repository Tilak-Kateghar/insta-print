"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const asyncHandler_1 = require("../utils/asyncHandler");
const rateLimit_1 = require("../middlewares/rateLimit");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authGuard_1 = require("../middlewares/authGuard");
const otp_1 = require("../utils/otp");
const AppError_1 = require("../utils/AppError");
const customLimiters_1 = require("../middlewares/customLimiters");
const logger_1 = require("../lib/logger");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new AppError_1.AppError("JWT_SECRET not configured", 500, "CONFIG_ERROR");
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN
    ? process.env.JWT_EXPIRES_IN
    : "7d";
router.post("/signup", rateLimit_1.strictLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { shopName, ownerName, phone, password } = req.body;
    if (!shopName || !ownerName || !phone || !password) {
        throw new AppError_1.AppError("Missing required fields: shopName, ownerName, phone, password", 400, "VALIDATION_ERROR");
    }
    if (password.length < 6) {
        throw new AppError_1.AppError("Password must be at least 6 characters", 400, "VALIDATION_ERROR");
    }
    const existingVendor = await prisma_1.default.vendor.findUnique({
        where: { phone },
    });
    if (existingVendor) {
        throw new AppError_1.AppError("Vendor with this phone number already exists", 409, "DUPLICATE_ENTRY");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    const vendor = await prisma_1.default.vendor.create({
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
}));
router.post("/login", rateLimit_1.strictLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const phone = String(req.body.phone || "").trim();
    const password = String(req.body.password || "");
    if (phone.length < 10) {
        throw new AppError_1.AppError("Invalid phone number", 400, "VALIDATION_ERROR");
    }
    if (password.length < 6) {
        throw new AppError_1.AppError("Password must be at least 6 characters", 400, "VALIDATION_ERROR");
    }
    const vendor = await prisma_1.default.vendor.findUnique({ where: { phone } });
    if (!vendor) {
        throw new AppError_1.AppError("Invalid credentials", 401, "AUTH_ERROR");
    }
    if (!vendor.isActive) {
        throw new AppError_1.AppError("Account is deactivated. Please contact support.", 403, "ACCOUNT_INACTIVE");
    }
    const ok = await bcryptjs_1.default.compare(password, vendor.password);
    if (!ok) {
        throw new AppError_1.AppError("Invalid credentials", 401, "AUTH_ERROR");
    }
    const token = jsonwebtoken_1.default.sign({ sub: vendor.id, role: "VENDOR" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: (process.env.NODE_ENV === "production" ? "strict" : "lax"),
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
}));
router.post("/forgot-password", customLimiters_1.vendorForgotOtpSendLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const phone = String(req.body.phone || "").trim();
    if (!phone || phone.length < 10) {
        throw new AppError_1.AppError("Valid phone number is required", 400, "VALIDATION_ERROR");
    }
    const vendor = await prisma_1.default.vendor.findUnique({ where: { phone } });
    // Don't reveal whether account exists
    if (!vendor) {
        return res.json({ message: "If account exists, OTP sent" });
    }
    const otp = (0, otp_1.generateOtp)();
    const otpHash = (0, otp_1.hashOtp)(phone, otp);
    await prisma_1.default.vendorPasswordReset.deleteMany({ where: { phone } });
    await prisma_1.default.vendorPasswordReset.create({
        data: {
            phone,
            otpHash,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
    });
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) {
        logger_1.logger.debug({ phone }, "VENDOR_FORGOT_PASSWORD_OTP");
        // eslint-disable-next-line no-console
        console.log("\n================ VENDOR FORGOT PASSWORD OTP ================\n" +
            `📱 Phone : ${phone}\n` +
            `🔐 OTP   : ${otp}\n` +
            "===========================================================\n");
    }
    return res.json({
        message: "OTP sent",
        ...(isDev && { otp }),
    });
}));
router.post("/verify-forgot-otp", customLimiters_1.vendorForgotOtpVerifyLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const phone = String(req.body.phone || "").trim();
    const otp = String(req.body.otp || "");
    if (!phone || !otp) {
        throw new AppError_1.AppError("Phone and OTP are required", 400, "VALIDATION_ERROR");
    }
    if (otp.length !== 6) {
        throw new AppError_1.AppError("OTP must be 6 digits", 400, "VALIDATION_ERROR");
    }
    const record = await prisma_1.default.vendorPasswordReset.findUnique({
        where: { phone },
    });
    if (!record) {
        throw new AppError_1.AppError("OTP not found or expired. Please request a new OTP.", 400, "OTP_NOT_FOUND");
    }
    if (record.expiresAt < new Date()) {
        await prisma_1.default.vendorPasswordReset.delete({ where: { phone } }).catch(() => { });
        throw new AppError_1.AppError("OTP has expired. Please request a new OTP.", 400, "OTP_EXPIRED");
    }
    if ((0, otp_1.hashOtp)(phone, otp) !== record.otpHash) {
        throw new AppError_1.AppError("Invalid OTP. Please try again.", 400, "INVALID_OTP");
    }
    res.json({ message: "OTP verified" });
}));
router.post("/reset-password", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const phone = String(req.body.phone || "").trim();
    const otp = String(req.body.otp || "");
    const newPassword = String(req.body.newPassword || "");
    if (!phone || !otp) {
        throw new AppError_1.AppError("Phone and OTP are required", 400, "VALIDATION_ERROR");
    }
    if (newPassword.length < 6) {
        throw new AppError_1.AppError("Password must be at least 6 characters", 400, "VALIDATION_ERROR");
    }
    const record = await prisma_1.default.vendorPasswordReset.findUnique({
        where: { phone },
    });
    if (!record || record.expiresAt < new Date()) {
        throw new AppError_1.AppError("OTP expired or invalid. Please start over.", 400, "OTP_INVALID");
    }
    if ((0, otp_1.hashOtp)(phone, otp) !== record.otpHash) {
        throw new AppError_1.AppError("Invalid OTP", 400, "INVALID_OTP");
    }
    const hashed = await bcryptjs_1.default.hash(newPassword, 12);
    try {
        await prisma_1.default.$transaction([
            prisma_1.default.vendor.update({
                where: { phone },
                data: { password: hashed },
            }),
            prisma_1.default.vendorPasswordReset.delete({
                where: { phone },
            }),
        ]);
    }
    catch (error) {
        logger_1.logger.error({ error, phone }, "PASSWORD_RESET_FAILED");
        throw new AppError_1.AppError("Failed to reset password. Please try again.", 500, "RESET_FAILED");
    }
    res.json({ message: "Password reset successful" });
}));
router.post("/logout", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    };
    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("role", { ...cookieOptions, httpOnly: false });
    res.json({ message: "Logged out" });
}));
router.get("/public", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const vendors = await prisma_1.default.vendor.findMany({
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
}));
router.get("/me/dashboard", (0, authGuard_1.authGuard)(["VENDOR"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendorId = req.auth?.id;
    if (!vendorId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    res.json({ ok: true, vendorId });
}));
exports.default = router;