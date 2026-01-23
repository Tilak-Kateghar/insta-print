"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpSMS = sendOtpSMS;
const axios_1 = __importDefault(require("axios"));
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
async function sendOtpSMS(phone, otp) {
    const payload = {
        route: "otp",
        variables_values: otp,
        numbers: phone,
    };
    try {
        const response = await axios_1.default.post("https://www.fast2sms.com/dev/bulkV2", payload, {
            headers: {
                authorization: FAST2SMS_API_KEY,
                "Content-Type": "application/json",
            },
            timeout: 7000,
        });
        if (!response.data?.return) {
            console.error("FAST2SMS FAILED:", response.data);
            throw new Error("Fast2SMS rejected request");
        }
        console.log("FAST2SMS SENT:", response.data);
        return response.data;
    }
    catch (err) {
        console.error("FAST2SMS ERROR:", err.response?.data || err.message);
        throw err;
    }
}