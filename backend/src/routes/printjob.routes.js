"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const ledgerGuards_1 = require("../domain/ledgerGuards");
const audit_1 = require("../domain/audit");
const rateLimit_1 = require("../middlewares/rateLimit");
const customLimiters_1 = require("../middlewares/customLimiters");
const customLimiters_2 = require("../middlewares/customLimiters");
const logger_1 = require("../lib/logger");
const asyncHandler_1 = require("../utils/asyncHandler");
const webhookAuth_1 = require("../middlewares/webhookAuth");
const AppError_1 = require("../utils/AppError");
const authGuard_1 = require("../middlewares/authGuard");
const upload_1 = require("../middlewares/upload");
const customLimiters_3 = require("../middlewares/customLimiters");
const file_type_1 = __importDefault(require("file-type"));
const supabase_1 = require("../lib/supabase");
const router = (0, express_1.Router)();
router.post("/", (0, authGuard_1.authGuard)(["USER"]), upload_1.upload.single("file"), customLimiters_3.uploadLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.auth?.id;
    if (!userId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    if (!req.file) {
        return res.status(400).json({ error: "File is required" });
    }
    const { copies, vendorId, colorMode, paperSize } = req.body;
    const parsedCopies = Number(copies);
    if (!Number.isInteger(parsedCopies) ||
        parsedCopies <= 0 ||
        typeof vendorId !== "string" ||
        !["COLOR", "BLACK_WHITE"].includes(colorMode) ||
        !["A4", "A3"].includes(paperSize)) {
        return res.status(400).json({ error: "Invalid input" });
    }
    const vendor = await prisma_1.default.vendor.findUnique({
        where: { id: vendorId },
    });
    if (!vendor || !vendor.isActive) {
        return res.status(400).json({ error: "Invalid vendor" });
    }
    const ALLOWED_MIME_TYPES = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    const detected = await file_type_1.default.fromBuffer(req.file.buffer);
    if (!detected ||
        !ALLOWED_MIME_TYPES.includes(detected.mime)) {
        return res.status(400).json({ error: "Invalid or unsupported file type" });
    }
    const job = await prisma_1.default.printJob.create({
        data: {
            fileUrl: "",
            copies: parsedCopies,
            colorMode,
            paperSize,
            userId,
            vendorId,
        },
    });
    const ext = req.file.originalname.split(".").pop() || "pdf";
    const fileKey = `print-jobs/${job.id}/original.${ext}`;
    const { error } = await supabase_1.supabase.storage
        .from(process.env.SUPABASE_STORAGE_BUCKET)
        .upload(fileKey, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
    });
    if (error) {
        await prisma_1.default.printJob.delete({ where: { id: job.id } });
        throw error;
    }
    await prisma_1.default.printJob.update({
        where: { id: job.id },
        data: { fileUrl: fileKey },
    });
    return res.status(201).json({ printJobId: job.id });
}));
router.get("/my", (0, authGuard_1.authGuard)(["USER"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.auth?.id;
    if (!userId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new AppError_1.AppError("User not found", 404, "NOT_FOUND");
    }
    const jobs = await prisma_1.default.printJob.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            vendor: {
                select: {
                    shopName: true,
                    ownerName: true,
                },
            },
            payment: true,
            pickupOtp: {
                select: { otp: true },
            },
        },
    });
    return res.status(200).json({ jobs });
}));
router.get("/:id/file", (0, authGuard_1.authGuard)(["USER", "VENDOR"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const jobId = String(req.params.id);
    const actorId = req.auth.id;
    const role = req.auth.role;
    const job = await prisma_1.default.printJob.findUnique({
        where: { id: jobId },
        select: {
            id: true,
            fileUrl: true,
            userId: true,
            vendorId: true,
        },
    });
    if (!job || !job.fileUrl) {
        return res.status(404).json({ error: "File not found" });
    }
    if ((role === "USER" && job.userId !== actorId) ||
        (role === "VENDOR" && job.vendorId !== actorId)) {
        return res.status(403).json({ error: "Forbidden" });
    }
    const { data, error } = await supabase_1.supabase.storage
        .from(process.env.SUPABASE_STORAGE_BUCKET)
        .createSignedUrl(job.fileUrl, 300);
    if (error || !data?.signedUrl) {
        throw error;
    }
    return res.status(200).json({
        downloadUrl: data.signedUrl,
        expiresInSeconds: 300,
    });
}));
router.get("/vendor/my", (0, authGuard_1.authGuard)(["VENDOR"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendorId = req.auth?.id;
    if (!vendorId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const vendor = await prisma_1.default.vendor.findUnique({
        where: { id: vendorId }
    });
    if (!vendor || !vendor.isActive) {
        throw new AppError_1.AppError("Vendor not found or inactive", 404, "NOT_FOUND");
    }
    const jobs = await prisma_1.default.printJob.findMany({
        where: {
            vendorId: vendorId,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            user: {
                select: { phone: true },
            },
        },
    });
    return res.status(200).json({
        vendor: {
            id: vendor.id,
            shopName: vendor.shopName,
            ownerName: vendor.ownerName,
            phone: vendor.phone,
        },
        jobs
    });
}));
router.get("/vendor/earnings", (0, authGuard_1.authGuard)(["VENDOR"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendorId = req.auth?.id;
    if (!vendorId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const vendor = await prisma_1.default.vendor.findUnique({
        where: { id: vendorId }
    });
    if (!vendor || !vendor.isActive) {
        throw new AppError_1.AppError("Vendor not found or inactive", 404, "NOT_FOUND");
    }
    const earnings = await prisma_1.default.vendorEarning.findMany({
        where: { vendorId: req.auth.id },
        orderBy: { createdAt: "desc" },
        include: {
            job: {
                select: {
                    id: true,
                    price: true,
                    completedAt: true,
                },
            },
        },
    });
    return res.status(200).json({ earnings });
}));
router.post("/vendor/settle", (0, authGuard_1.authGuard)(["VENDOR"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendorId = req.auth?.id;
    if (!vendorId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const unsettled = await prisma_1.default.vendorEarning.findMany({
        where: {
            vendorId,
            settledAt: null,
        },
    });
    if (unsettled.length === 0) {
        return res.status(400).json({ error: "No earnings to settle" });
    }
    const settlementRef = `VENDOR_SETTLE_${Date.now()}`;
    await prisma_1.default.$transaction(async (tx) => {
        for (const e of unsettled) {
            await tx.vendorEarning.update({
                where: { id: e.id },
                data: {
                    settledAt: new Date(),
                    settlementRef,
                },
            });
        }
        await tx.auditLog.create({
            data: {
                entityType: "VENDOR",
                entityId: vendorId,
                action: "SELF_SETTLED",
                actorType: "VENDOR",
                actorId: vendorId,
                metadata: {
                    settlementRef,
                    jobsSettled: unsettled.length,
                },
            },
        });
    });
    res.json({
        message: "Settlement completed",
        settlementRef,
        jobsSettled: unsettled.length,
    });
}));
router.get("/vendor/:id", (0, authGuard_1.authGuard)(["VENDOR"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendorId = req.auth?.id;
    if (!vendorId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const jobId = String(req.params.id);
    const job = await prisma_1.default.printJob.findUnique({
        where: { id: jobId },
        include: {
            user: {
                select: { phone: true },
            },
            payment: true,
        },
    });
    if (!job || job.vendorId !== vendorId) {
        throw new AppError_1.AppError("Job not found", 404, "NOT_FOUND");
    }
    return res.json({ job });
}));
router.get("/admin/vendors/pending-settlement", (0, authGuard_1.authGuard)(["ADMIN"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const unsettled = await prisma_1.default.vendorEarning.groupBy({
        by: ["vendorId"],
        where: { settledAt: null },
        _sum: { netAmount: true },
    });
    res.json({
        vendors: unsettled.map(v => ({
            vendorId: v.vendorId,
            totalNet: v._sum.netAmount || 0,
        })),
    });
}));
router.get("/vendor/earnings/summary", (0, authGuard_1.authGuard)(["VENDOR"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendorId = req.auth?.id;
    if (!vendorId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const vendor = await prisma_1.default.vendor.findUnique({
        where: { id: vendorId }
    });
    if (!vendor || !vendor.isActive) {
        throw new AppError_1.AppError("Vendor not found or inactive", 404, "NOT_FOUND");
    }
    const earnings = await prisma_1.default.vendorEarning.findMany({
        where: { vendorId: vendorId },
        select: {
            grossAmount: true,
            platformFee: true,
            netAmount: true,
            settledAt: true,
        },
    });
    const summary = earnings.reduce((acc, e) => {
        acc.totalGross += e.grossAmount;
        acc.totalPlatformFee += e.platformFee;
        acc.totalNetEarned += e.netAmount;
        if (e.settledAt) {
            acc.totalSettled += e.netAmount;
        }
        return acc;
    }, {
        totalGross: 0,
        totalPlatformFee: 0,
        totalNetEarned: 0,
        totalSettled: 0,
    });
    const pendingSettlement = summary.totalNetEarned - summary.totalSettled;
    return res.status(200).json({
        ...summary,
        pendingSettlement,
    });
}));
router.patch("/:id/status", (0, authGuard_1.authGuard)(["VENDOR"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendorId = req.auth?.id;
    if (!vendorId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const vendor = await prisma_1.default.vendor.findUnique({
        where: { id: vendorId }
    });
    if (!vendor || !vendor.isActive) {
        throw new AppError_1.AppError("Vendor not found or inactive", 404, "NOT_FOUND");
    }
    const jobId = String(req.params.id);
    const { status } = req.body;
    if (!Object.values(client_1.PrintJobStatus).includes(status)) {
        throw new AppError_1.AppError("Invalid status value", 400, "VALIDATION_ERROR");
    }
    if (status !== client_1.PrintJobStatus.READY) {
        throw new AppError_1.AppError("Invalid status value", 400, "VALIDATION_ERROR");
    }
    const nextStatus = client_1.PrintJobStatus.READY;
    const job = await prisma_1.default.printJob.findUnique({
        where: { id: jobId },
        include: {
            payment: true,
            pickupOtp: true,
        },
    });
    if (!job || job.vendorId !== vendorId) {
        throw new AppError_1.AppError("Print job not found", 404, "NOT_FOUND");
    }
    if (job.price === null) {
        return res.status(400).json({ error: "Price not set yet" });
    }
    if (!job.priceAccepted) {
        return res.status(400).json({ error: "Price not accepted by user" });
    }
    const validTransitions = {
        PENDING: client_1.PrintJobStatus.READY,
        READY: null,
        COMPLETED: null,
        CANCELLED: null,
    };
    if (validTransitions[job.status] !== nextStatus) {
        return res.status(400).json({ error: "Invalid status transition" });
    }
    const updatedJob = await prisma_1.default.printJob.update({
        where: { id: jobId },
        data: {
            status: nextStatus,
        },
    });
    return res.status(200).json({ printJob: updatedJob });
}));
router.get("/:id", (0, authGuard_1.authGuard)(["USER"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const jobId = String(req.params.id);
    const job = await prisma_1.default.printJob.findUnique({
        where: { id: jobId },
        include: {
            vendor: {
                select: {
                    shopName: true,
                },
            },
            payment: {
                select: {
                    status: true,
                    method: true,
                },
            },
            pickupOtp: {
                select: {
                    otp: true,
                },
            },
        },
    });
    if (!job || job.userId !== req.auth.id) {
        return res.status(404).json({ error: "Job not found" });
    }
    return res.json({ job });
}));
router.post("/:id/pickup-otp", customLimiters_2.pickupLimiter, (0, authGuard_1.authGuard)(["VENDOR"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendorId = req.auth?.id;
    if (!vendorId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const vendor = await prisma_1.default.vendor.findUnique({
        where: { id: vendorId }
    });
    if (!vendor || !vendor.isActive) {
        throw new AppError_1.AppError("Vendor not found or inactive", 404, "NOT_FOUND");
    }
    const jobId = String(req.params.id);
    const job = await prisma_1.default.printJob.findUnique({
        where: { id: jobId },
        include: {
            payment: true,
            pickupOtp: true,
        },
    });
    if (!job || job.vendorId !== req.auth.id) {
        return res.status(404).json({ error: "Print job not found" });
    }
    const payment = job.payment;
    if (!payment) {
        return res.status(400).json({ error: "Payment not created" });
    }
    if (job.status !== "READY") {
        return res.status(400).json({ error: "Job is not ready for pickup" });
    }
    if (payment.status === client_2.PaymentStatus.FAILED) {
        return res.status(400).json({ error: "Payment already failed" });
    }
    if (payment.method === client_2.PaymentMethod.ONLINE &&
        payment.status !== client_2.PaymentStatus.PAID) {
        return res.status(400).json({ error: "Online payment not completed" });
    }
    if (payment.method === client_2.PaymentMethod.OFFLINE &&
        payment.status !== client_2.PaymentStatus.PAID) {
        return res.status(400).json({ error: "Offline payment not confirmed" });
    }
    const existingOtp = await prisma_1.default.pickupOtp.findUnique({
        where: { jobId },
    });
    if (existingOtp) {
        return res.status(400).json({
            error: "Pickup OTP already generated",
        });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await prisma_1.default.pickupOtp.create({
        data: {
            otp,
            expiresAt,
            jobId,
            userId: job.userId,
        },
    });
    if (process.env.NODE_ENV !== "production") {
        logger_1.logger.debug({ jobId }, "PICKUP_OTP_GENERATED");
    }
    return res.status(200).json({
        message: "Pickup OTP generated",
        ...(process.env.NODE_ENV !== "production" && { otp }),
    });
}));
router.post("/:id/verify-pickup", customLimiters_2.pickupLimiter, (0, authGuard_1.authGuard)(["VENDOR"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    logger_1.logger.info("🔥 VERIFY PICKUP ROUTE HIT");
    const vendorId = req.auth?.id;
    if (!vendorId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const vendor = await prisma_1.default.vendor.findUnique({
        where: { id: vendorId }
    });
    if (!vendor || !vendor.isActive) {
        throw new AppError_1.AppError("Vendor not found or inactive", 404, "NOT_FOUND");
    }
    const jobId = String(req.params.id);
    const { otp } = req.body;
    if (typeof jobId !== "string" || typeof otp !== "string") {
        throw new AppError_1.AppError("Invalid request", 400, "VALIDATION_ERROR");
    }
    const job = await prisma_1.default.printJob.findUnique({
        where: { id: jobId },
        include: {
            payment: true,
            pickupOtp: true,
        },
    });
    if (!job || job.vendorId !== vendorId) {
        throw new AppError_1.AppError("Print job not found", 404, "NOT_FOUND");
    }
    const payment = job.payment;
    if (!payment) {
        return res.status(400).json({ error: "Payment not created" });
    }
    if (job.status !== "READY") {
        return res.status(400).json({ error: "Job is not ready for pickup" });
    }
    if (!job.priceAccepted) {
        return res.status(400).json({ error: "Price not accepted" });
    }
    if (payment.method === client_2.PaymentMethod.ONLINE &&
        payment.status !== client_2.PaymentStatus.PAID) {
        return res.status(400).json({ error: "Online payment not completed" });
    }
    if (payment.method === client_2.PaymentMethod.OFFLINE &&
        payment.status !== client_2.PaymentStatus.PAID) {
        return res.status(400).json({
            error: "Offline payment not confirmed by vendor",
        });
    }
    const pickupOtp = await prisma_1.default.pickupOtp.findUnique({
        where: { jobId },
    });
    if (!pickupOtp) {
        return res.status(404).json({ error: "Pickup OTP not found" });
    }
    if (pickupOtp.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
    }
    if (pickupOtp.expiresAt < new Date()) {
        await prisma_1.default.pickupOtp.delete({ where: { id: pickupOtp.id } });
        return res.status(400).json({ error: "OTP expired" });
    }
    await prisma_1.default.$transaction(async (tx) => {
        await tx.printJob.update({
            where: { id: jobId },
            data: { status: client_1.PrintJobStatus.COMPLETED },
        });
        await tx.auditLog.create({
            data: {
                entityType: "PRINT_JOB",
                entityId: jobId,
                action: "COMPLETED",
                actorType: "VENDOR",
                actorId: vendor.id,
            },
        });
        await tx.pickupOtp.delete({
            where: { id: pickupOtp.id },
        });
        const gross = payment.amount;
        const platformFee = Math.floor(gross * 0.1);
        const net = gross - platformFee;
        await tx.vendorEarning.create({
            data: {
                vendorId: job.vendorId,
                jobId: job.id,
                grossAmount: gross,
                platformFee,
                netAmount: net,
            },
        });
    });
    return res.status(200).json({
        message: "Pickup verified. Job completed.",
    });
}));
router.post("/:id/set-price", (0, authGuard_1.authGuard)(["VENDOR"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const jobId = req.params.id;
    const price = Number(req.body.price);
    if (!price || price < 0) {
        throw new AppError_1.AppError("Invalid price", 400);
    }
    const job = await prisma_1.default.printJob.findUnique({
        where: { id: jobId },
    });
    if (!job || job.vendorId !== req.auth.id) {
        throw new AppError_1.AppError("Unauthorized", 403);
    }
    const updated = await prisma_1.default.printJob.update({
        where: { id: jobId },
        data: { price },
    });
    res.json({ job: updated });
}));
router.post("/:id/accept-price", (0, authGuard_1.authGuard)(["USER"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.auth?.id;
    if (!userId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new AppError_1.AppError("User not found", 404, "NOT_FOUND");
    }
    const jobId = String(req.params.id);
    const job = await prisma_1.default.printJob.findUnique({
        where: { id: jobId },
        include: {
            payment: true,
            pickupOtp: true,
        },
    });
    if (!job || job.userId !== user.id) {
        return res.status(404).json({ error: "Print job not found" });
    }
    if (job.status !== "PENDING") {
        return res.status(400).json({ error: "Price can be accepted only for PENDING jobs" });
    }
    if (job.price === null) {
        return res.status(400).json({ error: "Price not set yet" });
    }
    if (job.priceAccepted) {
        return res.status(400).json({ error: "Price already accepted" });
    }
    const updatedJob = await prisma_1.default.printJob.update({
        where: { id: jobId },
        data: {
            priceAccepted: true,
            priceAcceptedAt: new Date(),
        },
    });
    return res.status(200).json({
        message: "Price accepted",
        printJob: updatedJob,
    });
}));
router.post("/:id/pay", customLimiters_1.paymentLimiter, (0, authGuard_1.authGuard)(["USER"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.auth?.id;
    if (!userId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new AppError_1.AppError("User not found", 404, "NOT_FOUND");
    }
    const jobId = String(req.params.id);
    const { method, idempotencyKey } = req.body;
    if (!idempotencyKey) {
        return res.status(400).json({ error: "Idempotency key required" });
    }
    const updatedPayment = await prisma_1.default.$transaction(async (tx) => {
        const existing = await tx.payment.findUnique({
            where: { idempotencyKey },
        });
        if (existing) {
            return existing;
        }
        const job = await tx.printJob.findUnique({
            where: { id: jobId },
            include: {
                payment: true,
                pickupOtp: true,
            },
        });
        if (!job || job.userId !== userId) {
            throw new AppError_1.AppError("Job not found", 404);
        }
        const payment = job.payment;
        if (!job.priceAccepted) {
            throw new AppError_1.AppError("Price not accepted", 400);
        }
        if (payment) {
            return payment;
        }
        const created = await tx.payment.create({
            data: {
                jobId: job.id,
                amount: job.price,
                method,
                status: client_2.PaymentStatus.INITIATED,
                idempotencyKey,
            },
        });
        await tx.auditLog.create({
            data: {
                entityType: "PAYMENT",
                entityId: created.id,
                action: "CREATED",
                actorType: "USER",
                actorId: user.id,
                metadata: {
                    jobId: job.id,
                    amount: created.amount,
                    method: created.method,
                },
            },
        });
        return created;
    });
    return res.status(201).json({
        paymentId: updatedPayment.id,
        amount: updatedPayment.amount,
    });
}));
router.post("/:id/mock-pay-success", (0, authGuard_1.authGuard)(["USER"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.auth?.id;
    if (!userId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const jobId = req.params.id;
    const job = await prisma_1.default.printJob.findUnique({
        where: { id: jobId },
        include: { payment: true },
    });
    if (!job || job.userId !== userId) {
        throw new AppError_1.AppError("Unauthorized", 403);
    }
    if (!job.payment) {
        throw new AppError_1.AppError("Payment not found", 400);
    }
    const updated = await prisma_1.default.payment.update({
        where: { id: job.payment.id },
        data: {
            status: "PAID",
            paidAt: new Date(),
        },
    });
    return res.json({
        message: "Mock payment marked as PAID",
        payment: updated,
    });
}));
router.post("/:id/mock-refund-success", (0, authGuard_1.authGuard)(["USER"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const job = await prisma_1.default.printJob.findUnique({
        where: { id: req.params.id },
        include: { payment: true },
    });
    if (!job?.payment) {
        throw new AppError_1.AppError("Payment not found", 400);
    }
    const updated = await prisma_1.default.payment.update({
        where: { id: job.payment.id },
        data: {
            status: "REFUNDED",
            refundedAt: new Date(),
        },
    });
    res.json({ payment: updated });
}));
router.post("/:id/confirm-offline-payment", rateLimit_1.strictLimiter, (0, authGuard_1.authGuard)(["VENDOR"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendorId = req.auth?.id;
    if (!vendorId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const vendor = await prisma_1.default.vendor.findUnique({
        where: { id: vendorId }
    });
    if (!vendor || !vendor.isActive) {
        throw new AppError_1.AppError("Vendor not found or inactive", 404, "NOT_FOUND");
    }
    const jobId = String(req.params.id);
    const job = await prisma_1.default.printJob.findUnique({
        where: { id: jobId },
        include: {
            payment: true,
            pickupOtp: true,
        },
    });
    if (!job || job.vendorId !== req.auth.id) {
        return res.status(404).json({ error: "Print job not found" });
    }
    const payment = job.payment;
    if (!payment || payment.method !== client_2.PaymentMethod.OFFLINE) {
        return res.status(400).json({ error: "Offline payment not applicable" });
    }
    if (payment.status === client_2.PaymentStatus.FAILED) {
        return res.status(400).json({ error: "Payment already failed" });
    }
    if (payment.status === client_2.PaymentStatus.PAID) {
        return res.status(200).json({
            message: "Offline payment already confirmed",
            payment: payment,
        });
    }
    const updatedPayment = await prisma_1.default.payment.update({
        where: { id: payment.id },
        data: {
            status: client_2.PaymentStatus.PAID,
            paidAt: new Date(),
            confirmedByVendorAt: new Date(),
        },
    });
    return res.status(200).json({
        message: "Offline payment confirmed",
        payment: updatedPayment,
    });
}));
router.post("/:id/cancel", rateLimit_1.strictLimiter, (0, authGuard_1.authGuard)(["USER"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.auth?.id;
    if (!userId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new AppError_1.AppError("User not found", 404, "NOT_FOUND");
    }
    const jobId = String(req.params.id);
    const job = await prisma_1.default.printJob.findUnique({
        where: { id: jobId },
        include: {
            payment: true,
            pickupOtp: true,
        },
    });
    if (!job || job.userId !== user.id) {
        return res.status(404).json({ error: "Job not found" });
    }
    const payment = job.payment;
    if (job.pickupOtp) {
        return res
            .status(400)
            .json({ error: "Pickup already initiated" });
    }
    if (job.status === client_1.PrintJobStatus.COMPLETED) {
        return res
            .status(400)
            .json({ error: "Completed job cannot be cancelled" });
    }
    if (job.pickupOtp) {
        return res
            .status(400)
            .json({ error: "Pickup already initiated" });
    }
    if (job.status !== client_1.PrintJobStatus.PENDING &&
        job.status !== client_1.PrintJobStatus.READY) {
        return res.status(400).json({ error: "Job cannot be cancelled" });
    }
    if (job.fileUrl) {
        await supabase_1.supabase.storage
            .from(process.env.SUPABASE_STORAGE_BUCKET)
            .remove([job.fileUrl]);
    }
    await prisma_1.default.$transaction(async (tx) => {
        if (payment) {
            if (payment.method === client_2.PaymentMethod.ONLINE) {
                if (payment.status === client_2.PaymentStatus.PAID) {
                    await tx.payment.update({
                        where: { id: payment.id },
                        data: { status: client_2.PaymentStatus.REFUND_PENDING },
                    });
                }
                else {
                    await tx.payment.update({
                        where: { id: payment.id },
                        data: { status: client_2.PaymentStatus.CANCELLED },
                    });
                }
            }
            if (payment.method === client_2.PaymentMethod.OFFLINE) {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: { status: client_2.PaymentStatus.CANCELLED },
                });
            }
        }
        await tx.printJob.update({
            where: { id: job.id },
            data: { status: client_1.PrintJobStatus.CANCELLED },
        });
        await tx.auditLog.create({
            data: {
                entityType: "PRINT_JOB",
                entityId: job.id,
                action: "CANCELLED",
                actorType: "USER",
                actorId: user.id,
                metadata: {
                    hadPayment: Boolean(payment),
                    paymentStatus: payment?.status ?? null,
                },
            },
        });
    });
    return res.status(200).json({
        message: "Job cancelled successfully",
    });
}));
router.post("/webhook/payment", webhookAuth_1.webhookAuth, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { orderId, paymentId, status } = req.body;
    const payment = await prisma_1.default.payment.findFirst({
        where: { gatewayOrderId: orderId },
    });
    if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
    }
    if (status === "success") {
        await prisma_1.default.payment.update({
            where: { id: payment.id },
            data: {
                status: client_2.PaymentStatus.PAID,
                gatewayPaymentId: paymentId,
                paidAt: new Date(),
            },
        });
    }
    else {
        await prisma_1.default.payment.update({
            where: { id: payment.id },
            data: {
                status: client_2.PaymentStatus.FAILED,
                failureReason: "Gateway failure",
            },
        });
    }
    await (0, audit_1.auditLog)({
        entityType: "PAYMENT",
        entityId: payment.id,
        action: status === "success" ? "PAID" : "FAILED",
        actorType: "SYSTEM",
        actorId: "PAYMENT_GATEWAY",
        metadata: {
            gatewayOrderId: orderId,
            gatewayPaymentId: paymentId,
        },
    });
    return res.status(200).json({ ok: true });
}));
router.post("/webhook/refund", webhookAuth_1.webhookAuth, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { paymentId, refundId, status } = req.body;
    const payment = await prisma_1.default.payment.findUnique({
        where: { id: paymentId },
        include: { job: true },
    });
    if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
    }
    if (payment.status === client_2.PaymentStatus.REFUNDED) {
        return res.status(200).json({ ok: true });
    }
    if (payment.status !== client_2.PaymentStatus.REFUND_PENDING) {
        return res.status(400).json({ error: "Invalid refund state" });
    }
    if (status === "success") {
        await prisma_1.default.payment.update({
            where: { id: payment.id },
            data: {
                status: client_2.PaymentStatus.REFUNDED,
                refundedAt: new Date(),
            },
        });
    }
    else {
        await prisma_1.default.payment.update({
            where: { id: payment.id },
            data: {
                failureReason: "Refund failed at gateway",
            },
        });
    }
    await (0, audit_1.auditLog)({
        entityType: "PAYMENT",
        entityId: payment.id,
        action: status === "success" ? "REFUNDED" : "REFUND_FAILED",
        actorType: "SYSTEM",
        actorId: "PAYMENT_GATEWAY",
        metadata: {
            refundId,
        },
    });
    return res.status(200).json({ ok: true });
}));
router.post("/admin/vendors/:vendorId/settle", (0, authGuard_1.authGuard)(["ADMIN"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const admin = await prisma_1.default.user.findUnique({
        where: { id: req.auth.id }
    });
    if (!admin) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const vendorId = Array.isArray(req.params.vendorId)
        ? req.params.vendorId[0]
        : req.params.vendorId;
    if (typeof vendorId !== "string") {
        return res.status(400).json({ error: "Invalid vendor id" });
    }
    const settlementRef = `SETTLE_${Date.now()}`;
    const unsettled = await prisma_1.default.vendorEarning.findMany({
        where: {
            vendorId,
            settledAt: null,
        },
    });
    if (unsettled.length === 0) {
        return res.status(400).json({ error: "No earnings to settle" });
    }
    const totalPayout = unsettled.reduce((sum, e) => sum + e.netAmount, 0);
    await prisma_1.default.$transaction(async (tx) => {
        for (const earning of unsettled) {
            (0, ledgerGuards_1.assertUnsettled)(earning);
            await tx.vendorEarning.update({
                where: { id: earning.id },
                data: {
                    settledAt: new Date(),
                    settlementRef,
                },
            });
        }
        await tx.auditLog.create({
            data: {
                entityType: "VENDOR",
                entityId: vendorId,
                action: "SETTLED",
                actorType: "ADMIN",
                actorId: admin.id,
                metadata: {
                    settlementRef,
                    totalPayout,
                    jobsSettled: unsettled.length,
                },
            },
        });
    });
    return res.status(200).json({
        message: "Vendor settled successfully",
        vendorId,
        settlementRef,
        totalPayout,
        jobsSettled: unsettled.length,
    });
}));
router.post("/vendor/settle", (0, authGuard_1.authGuard)(["VENDOR"]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendorId = req.auth?.id;
    if (!vendorId) {
        throw new AppError_1.AppError("Unauthorized", 401, "AUTH_ERROR");
    }
    const unsettled = await prisma_1.default.vendorEarning.findMany({
        where: {
            vendorId,
            settledAt: null,
        },
    });
    if (unsettled.length === 0) {
        throw new AppError_1.AppError("No earnings to settle", 400, "NO_EARNINGS");
    }
    const settlementRef = `VENDOR_SETTLE_${Date.now()}`;
    const totalAmount = unsettled.reduce((sum, e) => sum + e.netAmount, 0);
    await prisma_1.default.$transaction(async (tx) => {
        for (const earning of unsettled) {
            await tx.vendorEarning.update({
                where: { id: earning.id },
                data: {
                    settledAt: new Date(),
                    settlementRef,
                },
            });
        }
        await tx.auditLog.create({
            data: {
                entityType: "VENDOR",
                entityId: vendorId,
                action: "SELF_SETTLED",
                actorType: "VENDOR",
                actorId: vendorId,
                metadata: {
                    settlementRef,
                    totalAmount,
                    jobsSettled: unsettled.length,
                },
            },
        });
    });
    return res.json({
        message: "Earnings settled successfully",
        totalAmount,
        jobsSettled: unsettled.length,
        settlementRef,
    });
}));
exports.default = router;