import express from "express";
import cors from "cors";
import prisma from "./lib/prisma";
import vendorRoutes from "./routes/vendor.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes"
import printJobRoutes from "./routes/printjob.routes";
import { moderateLimiter } from "./middlewares/rateLimit";
import { requestLogger } from "./middlewares/requestLogger";
import { authGuard } from "./middlewares/authGuard";
import cookieParser from "cookie-parser";
import { AppError } from "./utils/AppError";
import { logger } from "./lib/logger";
import type { Request, Response, NextFunction } from "express";

const app = express();
app.use(requestLogger);

const corsOrigins = process.env.CORS_ORIGINS?.split(",") || [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(moderateLimiter);
app.use(express.json());
app.use(cookieParser());
app.use("/vendors", vendorRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/print-jobs", printJobRoutes);

app.use((
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code ?? undefined,
    });
  }

  logger.error({ err }, "UNHANDLED_ERROR");

  return res.status(500).json({
    error: "Internal server error",
  });
});

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

app.get("/user/me", authGuard(["USER"]), async (req, res) => {
  console.log("AUTH:", req.auth);

  const user = await prisma.user.findUnique({
    where: { id: req.auth!.id },
  });

  console.log("USER:", user);

  res.json({ user });
});


app.get("/vendor/me", moderateLimiter, authGuard(["VENDOR"]), (req, res) => {
  const vendor = req.auth!.id;
  res.json({ vendor });
});

export default app;