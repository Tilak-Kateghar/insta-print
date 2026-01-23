export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : ("lax" as const),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  } as const;
}