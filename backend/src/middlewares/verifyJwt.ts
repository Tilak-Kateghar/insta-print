import jwt, { JwtPayload, Secret } from "jsonwebtoken";

export interface AuthJwtPayload extends JwtPayload {
  sub: string;
  role: "USER" | "VENDOR" | "ADMIN";
}

const JWT_SECRET: Secret = (() => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not set");
  }
  return process.env.JWT_SECRET;
})();

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not set");
}

/**
 * Verifies JWT and enforces payload shape
 */
export function verifyJwt(token: string): AuthJwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as unknown;

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof (decoded as any).sub !== "string" ||
    !["USER", "VENDOR", "ADMIN"].includes((decoded as any).role)
  ) {
    throw new Error("Invalid JWT payload");
  }

  return decoded as AuthJwtPayload;
}