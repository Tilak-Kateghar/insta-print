"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = authGuard;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
function authGuard(allowedRoles) {
    return (req, res, next) => {
        const token = req.cookies?.access_token;
        if (!token) {
            return res.status(401).json({ error: "Authentication required" });
        }
        try {
            const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.auth = {
                id: payload.sub,
                role: payload.role,
            };
            if (!allowedRoles.includes(payload.role)) {
                return res.status(403).json({ error: "Access denied" });
            }
            next();
        }
        catch {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
    };
}