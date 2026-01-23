"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = auditLog;
const prisma_1 = __importDefault(require("../lib/prisma"));
async function auditLog(input) {
    await prisma_1.default.auditLog.create({
        data: {
            entityType: input.entityType,
            entityId: input.entityId,
            action: input.action,
            actorType: input.actorType,
            actorId: input.actorId,
            metadata: input.metadata,
        },
    });
}
