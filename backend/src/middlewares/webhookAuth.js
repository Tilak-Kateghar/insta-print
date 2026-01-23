"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookAuth = webhookAuth;
function webhookAuth(req, res, next) {
    const secret = req.headers["x-webhook-secret"];
    if (secret !== process.env.PAYMENT_WEBHOOK_SECRET) {
        return res.status(401).json({ error: "Invalid webhook signature" });
    }
    next();
}
