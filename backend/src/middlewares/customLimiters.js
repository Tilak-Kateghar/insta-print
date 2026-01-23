"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorForgotOtpVerifyLimiter = exports.vendorForgotOtpSendLimiter = exports.pickupLimiter = exports.paymentLimiter = exports.pricingLimiter = exports.uploadLimiter = exports.otpVerifyLimiter = exports.otpSendLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const safeKey = (value, prefix = "anon") => value && value.length > 0 ? value : `${prefix}:unknown`;
exports.otpSendLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => safeKey(req.body?.phone, "otp-send"),
    handler: (_req, res) => {
        try {
            res.status(429).json({
                error: "Too many OTP requests. Try later.",
                state: "rate_limited",
            });
        }
        catch (error) {
            console.error("Error in otpSendLimiter handler:", error);
            res.status(500).json({
                error: "Internal server error",
                state: "error",
            });
        }
    },
});
exports.otpVerifyLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => safeKey(req.body?.phone, "otp-verify"),
    handler: (_req, res) => {
        res.status(429).json({
            error: "Too many OTP attempts.",
            state: "rate_limited",
        });
    },
});
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 15,
    keyGenerator: (req) => safeKey(req.auth?.id, "upload"),
    handler: (_req, res) => {
        res.status(429).json({
            error: "Upload limit exceeded.",
            state: "rate_limited",
        });
    },
});
exports.pricingLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 20,
    keyGenerator: (req) => safeKey(`${req.auth?.id}:${req.params?.id}`, "pricing"),
    handler: (_req, res) => {
        res.status(429).json({
            error: "Too many pricing attempts.",
            state: "rate_limited",
        });
    },
});
exports.paymentLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 15,
    keyGenerator: (req) => safeKey(`${req.auth?.id}:${req.params?.id}`, "payment"),
    handler: (_req, res) => {
        res.status(429).json({
            error: "Too many payment attempts.",
            state: "rate_limited",
        });
    },
});
exports.pickupLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 15,
    keyGenerator: (req) => safeKey(`${req.auth?.id}:${req.params?.id}`, "pickup"),
    handler: (_req, res) => {
        res.status(429).json({
            error: "Too many pickup attempts.",
            state: "rate_limited",
        });
    },
});
exports.vendorForgotOtpSendLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => safeKey(req.body?.phone, "vendor-forgot-send"),
    handler: (_req, res) => {
        res.status(429).json({
            error: "Too many reset attempts. Try again later.",
            state: "rate_limited",
        });
    },
});
exports.vendorForgotOtpVerifyLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => safeKey(req.body?.phone, "vendor-forgot-verify"),
    handler: (_req, res) => {
        res.status(429).json({
            error: "Too many OTP attempts. Please retry later.",
            state: "rate_limited",
        });
    },
});