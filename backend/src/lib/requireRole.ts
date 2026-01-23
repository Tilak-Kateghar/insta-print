import { Request, Response, NextFunction } from "express";

export function requireRole(role: "USER" | "VENDOR") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.auth.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
}