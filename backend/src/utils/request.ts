import { Request } from "express";
import { User, Vendor } from "@prisma/client";

export function getUser(req: Request): User {
  return (req as any).user;
}

export function getVendor(req: Request): Vendor {
  return (req as any).vendor;
}