"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashOtp = hashOtp;
exports.generateOtp = generateOtp;
const crypto_1 = __importDefault(require("crypto"));
const OTP_SECRET = process.env.OTP_SECRET || "otp-secret";
function hashOtp(phone, otp) {
    return crypto_1.default
        .createHmac("sha256", OTP_SECRET)
        .update(`${phone}:${otp}`)
        .digest("hex");
}
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}