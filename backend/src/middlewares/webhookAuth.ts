// src/middlewares/webhookAuth.ts
import { Request, Response, NextFunction } from "express";

export function webhookAuth(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers["x-webhook-secret"];
  if (secret !== process.env.PAYMENT_WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Invalid webhook signature" });
  }
  next();
}