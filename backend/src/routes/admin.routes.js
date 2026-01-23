"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const authGuard_1 = require("../middlewares/authGuard");
const asyncHandler_1 = require("../utils/asyncHandler");
const AppError_1 = require("../utils/AppError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";
if (!JWT_SECRET) {
    throw new AppError_1.AppError("JWT_SECRET not configured", 500, "CONFIG_ERROR");
}
const router = (0, express_1.Router)();
router.get("/me", (0, authGuard_1.authGuard)(["ADMIN"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const adminId = req.auth?.id;
    if (!adminId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const admin = await prisma_1.default.user.findUnique({
        where: { id: adminId },
        select: {
            id: true,
            phone: true,
            role: true,
            createdAt: true,
        },
    });
    if (!admin) {
        throw new AppError_1.AppError("Admin not found", 404, "NOT_FOUND");
    }
    res.json({ admin });
}));
router.post("/login", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { phone } = req.body;
    if (!phone || typeof phone !== "string") {
        throw new AppError_1.AppError("Valid phone number is required", 400, "VALIDATION_ERROR");
    }
    const admin = await prisma_1.default.user.findFirst({
        where: {
            phone,
            role: "ADMIN",
        },
    });
    if (!admin) {
        throw new AppError_1.AppError("Invalid admin credentials", 401, "AUTH_ERROR");
    }
    const token = jsonwebtoken_1.default.sign({ sub: admin.id, role: "ADMIN" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    };
    res.cookie("access_token", token, cookieOptions);
    res.cookie("role", "ADMIN", { ...cookieOptions, httpOnly: false });
    res.json({ message: "Admin logged in" });
}));
router.post("/logout", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    };
    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("role", { ...cookieOptions, httpOnly: false });
    res.json({ message: "Admin logged out" });
}));
exports.default = router;
