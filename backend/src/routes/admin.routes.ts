import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authGuard } from "../middlewares/authGuard";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import jwt from "jsonwebtoken";
import { getAuthCookieOptions } from "../utils/cookies";
import { logger } from "../lib/logger";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

if (!JWT_SECRET) {
  throw new AppError("JWT_SECRET not configured", 500, "CONFIG_ERROR");
}

const router = Router();

router.get(
  "/me", 
  authGuard(["ADMIN"]), 
  asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.auth?.id;
    
    if (!adminId) {
      throw new AppError("Unauthorized", 401, "AUTH_ERROR");
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!admin) {
      throw new AppError("Admin not found", 404, "NOT_FOUND");
    }

    res.json({ admin });
  })
);

router.post(
  "/login", 
  asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;

    if (!phone || typeof phone !== "string") {
      throw new AppError("Valid phone number is required", 400, "VALIDATION_ERROR");
    }

    const admin = await prisma.user.findFirst({
      where: {
        phone,
        role: "ADMIN",
      },
    });

    if (!admin) {
      throw new AppError("Invalid admin credentials", 401, "AUTH_ERROR");
    }

    const token = jwt.sign(
      { sub: admin.id, role: "ADMIN" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };

    res.cookie("access_token", token, getAuthCookieOptions());
    res.cookie("role", "ADMIN", {
      ...getAuthCookieOptions(),
      httpOnly: false,
    });

    return res.json({ success: true });
  })
);

router.post(
  "/logout", 
  asyncHandler(async (_req: Request, res: Response) => {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };

    const opts = getAuthCookieOptions();
    res.clearCookie("access_token", opts);
    res.clearCookie("role", { ...opts, httpOnly: false });

    return res.json({ success: true });
  })
);

export default router;