"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSmsOTP = sendSmsOTP;
const axios_1 = __importDefault(require("axios"));
const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";
async function sendSmsOTP(phone, otp) {
    if (!process.env.FAST2SMS_API_KEY) {
        throw new Error("FAST2SMS_API_KEY not configured");
    }
    const message = `Your InstaPrint OTP is ${otp}. Valid for 5 minutes.`;
    try {
        await axios_1.default.post(FAST2SMS_URL, {
            route: "otp",
            variables_values: otp,
            numbers: phone,
            message,
            sender_id: process.env.FAST2SMS_SENDER_ID || "FSTSMS",
        }, {
            headers: {
                authorization: process.env.FAST2SMS_API_KEY,
                "Content-Type": "application/json",
            },
            timeout: 5000,
        });
    }
    catch (err) {
        // Do NOT expose Fast2SMS error details to users
        console.error("FAST2SMS_ERROR", err?.response?.data || err.message);
        throw new Error("Failed to send OTP");
    }
}