"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertUnsettled = assertUnsettled;
// src/domain/ledgerGuards.ts
function assertUnsettled(earning) {
    if (earning.settledAt) {
        throw new Error("Settled earnings cannot be modified");
    }
}
