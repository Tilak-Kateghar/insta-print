import crypto from "crypto";

const OTP_SECRET = process.env.OTP_SECRET || "otp-secret";

export function hashOtp(phone: string, otp: string): string {
  return crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${phone}:${otp}`)
    .digest("hex");
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}