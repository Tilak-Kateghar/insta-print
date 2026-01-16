// src/domain/ledgerGuards.ts
export function assertUnsettled(earning: { settledAt: Date | null }) {
  if (earning.settledAt) {
    throw new Error("Settled earnings cannot be modified");
  }
}