"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = verifyJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = (() => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not set");
    }
    return process.env.JWT_SECRET;
})();
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not set");
}
function verifyJwt(token) {
    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    if (typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.sub !== "string" ||
        !["USER", "VENDOR", "ADMIN"].includes(decoded.role)) {
        throw new Error("Invalid JWT payload");
    }
    return decoded;
}
