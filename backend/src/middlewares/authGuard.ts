import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type Role = "USER" | "VENDOR" | "ADMIN";

interface JwtPayload {
  sub: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: string;
        role: Role;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET!;

export function authGuard(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

      req.auth = {
        id: payload.sub,
        role: payload.role,
      };

      if (!allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}