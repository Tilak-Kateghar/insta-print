import http from "http";
import app from "./app";
import prisma from "./lib/prisma";
import { logger } from "./lib/logger";

const requiredEnv = [
  "DATABASE_URL",
  "JWT_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info({ port: PORT }, "SERVER_STARTED");
});

async function shutdown(signal: string) {
  logger.warn({ signal }, "SHUTDOWN_INITIATED");

  server.close(async () => {
    logger.info("HTTP_SERVER_CLOSED");

    try {
      await prisma.$disconnect();
      logger.info("PRISMA_DISCONNECTED");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "SHUTDOWN_FAILED");
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.fatal("FORCED_SHUTDOWN");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);