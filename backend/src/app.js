"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const vendor_routes_1 = __importDefault(require("./routes/vendor.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const printjob_routes_1 = __importDefault(require("./routes/printjob.routes"));
const rateLimit_1 = require("./middlewares/rateLimit");
const requestLogger_1 = require("./middlewares/requestLogger");
const authGuard_1 = require("./middlewares/authGuard");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const AppError_1 = require("./utils/AppError");
const logger_1 = require("./lib/logger");
const app = (0, express_1.default)();
app.use(requestLogger_1.requestLogger);
const corsOrigins = process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
];
app.use((0, cors_1.default)({
    origin: corsOrigins,
    credentials: true,
}));
app.use(rateLimit_1.moderateLimiter);
app.use(express_1.default.json({ limit: "10mb" }));
app.use((0, cookie_parser_1.default)());
app.use("/vendors", vendor_routes_1.default);
app.use("/users", user_routes_1.default);
app.use("/admin", admin_routes_1.default);
app.use("/print-jobs", printjob_routes_1.default);
app.use((err, _req, res, _next) => {
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code ?? undefined,
        });
    }
    if (err && typeof err === "object" && "code" in err) {
        const prismaError = err;
        if (prismaError.code === "P2002") {
            return res.status(409).json({
                error: "A record with this value already exists",
                code: "DUPLICATE_ENTRY",
            });
        }
        if (prismaError.code === "P2025") {
            return res.status(404).json({
                error: "Record not found",
                code: "NOT_FOUND",
            });
        }
    }
    const safeError = err instanceof Error ? { message: err.message, name: err.name, stack: err.stack } : String(err);
    logger_1.logger.error({ err: safeError }, "UNHANDLED_ERROR");
    const isProduction = process.env.NODE_ENV === "production";
    return res.status(500).json({
        error: isProduction ? "Internal server error" : (err instanceof Error ? err.message : "Unknown error"),
    });
});
app.get("/health", async (_req, res) => {
    try {
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.status(200).json({ status: "ok", db: "connected" });
    }
    catch (err) {
        logger_1.logger.error({ err }, "HEALTH_CHECK_FAILED");
        res.status(500).json({ status: "error", db: "disconnected" });
    }
});
app.get("/user/me", (0, authGuard_1.authGuard)(["USER"]), async (req, res, next) => {
    try {
        const userId = req.auth?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        res.json({ user });
    }
    catch (error) {
        next(error);
    }
});
app.get("/vendor/me", rateLimit_1.moderateLimiter, (0, authGuard_1.authGuard)(["VENDOR"]), (req, res, next) => {
    try {
        const vendorId = req.auth?.id;
        if (!vendorId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        res.json({ vendor: vendorId });
    }
    catch (error) {
        next(error);
    }
});
exports.default = app;