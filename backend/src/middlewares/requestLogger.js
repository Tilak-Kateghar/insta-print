"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const uuid_1 = require("uuid");
const logger_1 = require("../lib/logger");
function requestLogger(req, _res, next) {
    const requestId = (0, uuid_1.v4)();
    req.requestId = requestId;
    logger_1.logger.info({
        requestId,
        method: req.method,
        path: req.originalUrl,
    }, "REQUEST_RECEIVED");
    next();
}
