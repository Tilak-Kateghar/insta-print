"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.getVendor = getVendor;
function getUser(req) {
    return req.user;
}
function getVendor(req) {
    return req.vendor;
}
