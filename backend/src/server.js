"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const logger_1 = require("./lib/logger");
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
const server = http_1.default.createServer(app_1.default);
server.listen(PORT, () => {
    logger_1.logger.info({ port: PORT }, "SERVER_STARTED");
});
async function shutdown(signal) {
    logger_1.logger.warn({ signal }, "SHUTDOWN_INITIATED");
    server.close(async () => {
        logger_1.logger.info("HTTP_SERVER_CLOSED");
        try {
            await prisma_1.default.$disconnect();
            logger_1.logger.info("PRISMA_DISCONNECTED");
            process.exit(0);
        }
        catch (err) {
            logger_1.logger.error({ err }, "SHUTDOWN_FAILED");
            process.exit(1);
        }
    });
    setTimeout(() => {
        logger_1.logger.fatal("FORCED_SHUTDOWN");
        process.exit(1);
    }, 10000);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);