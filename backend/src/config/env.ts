export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID!,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET!,
};