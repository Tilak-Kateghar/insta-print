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

const allowedOrigins = [
  "http://localhost:3000",
  "https://insta-print.onrender.com"
];

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://insta-print.onrender.com",
    ],
    credentials: true,
  })
);

app.use(moderateLimiter);
app.use(express.json({ limit: "10mb" }));
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

  if (err && typeof err === "object" && "code" in err) {
    const prismaError = err as { code: string; message?: string };
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
  logger.error({ err: safeError }, "UNHANDLED_ERROR");

  const isProduction = process.env.NODE_ENV === "production";
  
  return res.status(500).json({
    error: isProduction ? "Internal server error" : (err instanceof Error ? err.message : "Unknown error"),
  });
});

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "connected" });
  } catch (err) {
    logger.error({ err }, "HEALTH_CHECK_FAILED");
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

app.get("/user/me", authGuard(["USER"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});


app.get("/vendor/me", moderateLimiter, authGuard(["VENDOR"]), (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.auth?.id;
    if (!vendorId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({ vendor: vendorId });
  } catch (error) {
    next(error);
  }
});

export default app;