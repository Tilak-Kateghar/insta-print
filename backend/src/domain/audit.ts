import prisma from "../lib/prisma";

type AuditInput = {
  entityType: string;
  entityId: string;
  action: string;
  actorType: "USER" | "VENDOR" | "ADMIN" | "SYSTEM";
  actorId?: string;
  metadata?: Record<string, any>;
};

export async function auditLog(input: AuditInput) {
  await prisma.auditLog.create({
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