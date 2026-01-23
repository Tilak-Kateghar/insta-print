import { Router } from "express";
import prisma from "../lib/prisma";
import { authGuard } from "../middlewares/authGuard";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";

const router = Router();

router.get("/me", authGuard(["ADMIN"]), async (req, res) => {
  const admin = await prisma.user.findUnique({
    where: { id: req.auth!.id },
    select: {
      id: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  res.json({ admin });
});

router.post("/login", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone required" });
  }

  const admin = await prisma.user.findFirst({
    where: {
      phone,
      role: "ADMIN",
    },
  });

  if (!admin) {
    return res.status(401).json({ error: "Admin not found" });
  }

  const token = jwt.sign(
    { sub: admin.id, role: "ADMIN" },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.cookie("access_token", token, {
    httpOnly: true,
    sameSite: "strict",
  });

  res.cookie("role", "ADMIN", {
    httpOnly: false,
    sameSite: "strict",
  });

  res.json({ message: "Admin logged in" });
});

router.post("/logout", async (_req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("access_token", {
    httpOnly: true,
    sameSite: "strict",
  });

  res.clearCookie("role", {
    httpOnly: false,
    sameSite: "strict",
  });

  res.json({ message: "Admin logged out" });
});

export default router;