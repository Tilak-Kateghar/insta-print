import { Router } from "express";
import prisma from "../lib/prisma";
import { PrintJobStatus } from "@prisma/client";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { assertUnsettled } from "../domain/ledgerGuards";
import { auditLog } from "../domain/audit";
import { strictLimiter } from "../middlewares/rateLimit";
import { pricingLimiter } from "../middlewares/customLimiters";
import { paymentLimiter } from "../middlewares/customLimiters";
import { pickupLimiter } from "../middlewares/customLimiters";
import { logger } from "../lib/logger";
import { asyncHandler } from "../utils/asyncHandler";
import { webhookAuth } from "../middlewares/webhookAuth";
import { AppError } from "../utils/AppError";
import { authGuard } from "../middlewares/authGuard";
import { upload } from "../middlewares/upload";
import FileType from "file-type";
import { supabase } from "../lib/supabase";

const router = Router();

// User creates a print job
router.post(
  "/",
  authGuard(["USER"]),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const userId = req.auth!.id;

    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const { copies, vendorId, colorMode, paperSize } = req.body;

    const parsedCopies = Number(copies);

    if (
      !Number.isInteger(parsedCopies) ||
      parsedCopies <= 0 ||
      typeof vendorId !== "string" ||
      !["COLOR", "BLACK_WHITE"].includes(colorMode) ||
      !["A4", "A3"].includes(paperSize)
    ) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor || !vendor.isActive) {
      return res.status(400).json({ error: "Invalid vendor" });
    }

    const ALLOWED_MIME_TYPES = [
      // Documents
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

      // Images
      "image/jpeg",
      "image/png",

      // Presentations
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    const detected = await FileType.fromBuffer(req.file.buffer);

    if (
      !detected ||
      !ALLOWED_MIME_TYPES.includes(detected.mime)
    ) {
      return res.status(400).json({ error: "Invalid or unsupported file type" });
    }

    // 1️⃣ Create job FIRST (empty fileUrl)
    const job = await prisma.printJob.create({
      data: {
        fileUrl: "",
        copies: parsedCopies,
        colorMode,
        paperSize,
        userId,
        vendorId,
      },
    });

    // 2️⃣ Build storage key
    const ext = req.file.originalname.split(".").pop() || "pdf";    
    const fileKey = `print-jobs/${job.id}/original.${ext}`;

    // 3️⃣ Upload to Supabase (PRIVATE)
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET!)
      .upload(fileKey, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) {
      await prisma.printJob.delete({ where: { id: job.id } });
      throw error;
    }

    // 4️⃣ Save fileKey in DB
    await prisma.printJob.update({
      where: { id: job.id },
      data: { fileUrl: fileKey },
    });

    return res.status(201).json({ printJobId: job.id });
  })
);

// User views their own print jobs
router.get(
  "/my",
  authGuard(["USER"]),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.id }
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const jobs = await prisma.printJob.findMany({
      where: {
        userId: user.id, // 🔐 ownership enforced
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ jobs });
  })
);

router.get(
  "/:id/file",
  authGuard(["USER", "VENDOR"]),
  asyncHandler(async (req, res) => {
    const jobId = String(req.params.id);
    const actorId = req.auth!.id;
    const role = req.auth!.role;

    const job = await prisma.printJob.findUnique({
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

    // 🔐 Ownership enforcement
    if (
      (role === "USER" && job.userId !== actorId) ||
      (role === "VENDOR" && job.vendorId !== actorId)
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // ⏳ Generate signed URL (5 minutes)
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET!)
      .createSignedUrl(job.fileUrl, 300);

    if (error || !data?.signedUrl) {
      throw error;
    }

    return res.status(200).json({
      downloadUrl: data.signedUrl,
      expiresInSeconds: 300,
    });
  })
);

// Vendor views jobs assigned to them
router.get(
  "/vendor/my",
  authGuard(["VENDOR"]),
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.auth!.id }
    });

    if (!vendor || !vendor.isActive) {
      return res.status(400).json({ error: "Invalid vendor" });
    }

    const jobs = await prisma.printJob.findMany({
      where: {
        vendorId: req.auth!.id, // 🔐 enforced
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ jobs });
  })
);

// Vendor views earnings ledger
router.get(
  "/vendor/earnings",
  authGuard(["VENDOR"]),
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.auth!.id }
    });

    if (!vendor || !vendor.isActive) {
      return res.status(400).json({ error: "Invalid vendor" });
    }

    const earnings = await prisma.vendorEarning.findMany({
      where: { vendorId: req.auth!.id },
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
  })
);

// Vendor earnings summary
router.get(
  "/vendor/earnings/summary",
  authGuard(["VENDOR"]),
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.auth!.id }
    });

    if (!vendor || !vendor.isActive) {
      return res.status(400).json({ error: "Invalid vendor" });
    }

    const earnings = await prisma.vendorEarning.findMany({
      where: { vendorId: req.auth!.id },
      select: {
        grossAmount: true,
        platformFee: true,
        netAmount: true,
        settledAt: true,
      },
    });

    const summary = earnings.reduce(
      (acc, e) => {
        acc.totalGross += e.grossAmount;
        acc.totalPlatformFee += e.platformFee;
        acc.totalNetEarned += e.netAmount;

        if (e.settledAt) {
          acc.totalSettled += e.netAmount;
        }

        return acc;
      },
      {
        totalGross: 0,
        totalPlatformFee: 0,
        totalNetEarned: 0,
        totalSettled: 0,
      }
    );

    const pendingSettlement =
      summary.totalNetEarned - summary.totalSettled;

    return res.status(200).json({
      ...summary,
      pendingSettlement,
    });
  })
);

// Vendor updates job status
router.patch(
  "/:id/status",
  authGuard(["VENDOR"]),
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.auth!.id }
    });

    if (!vendor || !vendor.isActive) {
      return res.status(400).json({ error: "Invalid vendor" });
    }

    const jobId = String(req.params.id);

    // if (!jobId) {
    //   throw new AppError("Invalid job id", 400);
    // }

    // if (typeof jobId !== "string") {
    //   throw new AppError("Invalid job id", 400);
    // }

    const { status } = req.body as { status: PrintJobStatus };

    // validate status
    if (!Object.values(PrintJobStatus).includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // validate allowed enum values
    if (status !== PrintJobStatus.READY) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const nextStatus: PrintJobStatus = PrintJobStatus.READY;

    const job = await prisma.printJob.findUnique({
      where: { id: jobId },
      include: {
        payment: true,
        pickupOtp: true,
      },
    });

    if (!job || job.vendorId !== req.auth!.id) {
      return res.status(404).json({ error: "Print job not found" });
    }

    if (job.price === null) {
      return res.status(400).json({ error: "Price not set yet" });
    }

    if (!job.priceAccepted) {
      return res.status(400).json({ error: "Price not accepted by user" });
    }

    // enforce valid transitions
    const validTransitions: Record<PrintJobStatus, PrintJobStatus | null> = {
      PENDING: PrintJobStatus.READY,
      READY: null,
      COMPLETED: null,
      CANCELLED: null, // 🔒 terminal state
    };

    if (validTransitions[job.status] !== nextStatus) {
      return res.status(400).json({ error: "Invalid status transition" });
    }

    const updatedJob = await prisma.printJob.update({
      where: { id: jobId },
      data: {
        status: nextStatus,
      },
    });

    return res.status(200).json({ printJob: updatedJob });
  })
);

// Vendor generates pickup OTP for a READY job
router.post(
  "/:id/pickup-otp",
  pickupLimiter,
  authGuard(["VENDOR"]),
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.auth!.id }
    });

    if (!vendor || !vendor.isActive) {
      return res.status(400).json({ error: "Invalid vendor" });
    }

    const jobId = String(req.params.id);

    // if (!jobId) {
    //   throw new AppError("Invalid job id", 400);
    // }

    // if (typeof jobId !== "string") {
    //   return res.status(400).json({ error: "Invalid job id" });
    // }

    const job = await prisma.printJob.findUnique({
      where: { id: jobId },
      include: {
        payment: true,
        pickupOtp: true,
      },
    });

    if (!job || job.vendorId !== req.auth!.id) {
      return res.status(404).json({ error: "Print job not found" });
    }

    const payment = job.payment;

    if (!payment) {
      return res.status(400).json({ error: "Payment not created" });
    }

    if (job.status !== "READY") {
      return res.status(400).json({ error: "Job is not ready for pickup" });
    }

    if (payment.status === PaymentStatus.FAILED) {
      return res.status(400).json({ error: "Payment already failed" });
    }

    if (
      payment.method === PaymentMethod.ONLINE &&
      payment.status !== PaymentStatus.PAID
    ) {
      return res.status(400).json({ error: "Online payment not completed" });
    }

    if (
      payment.method === PaymentMethod.OFFLINE &&
      payment.status !== PaymentStatus.PAID
    ) {
      return res.status(400).json({ error: "Offline payment not confirmed" });
    }

    /* ✅ THEN continue to OTP existence check + generation */

    // 🚫 Prevent OTP re-generation
    const existingOtp = await prisma.pickupOtp.findUnique({
      where: { jobId },
    });

    if (existingOtp) {
      return res.status(400).json({
        error: "Pickup OTP already generated",
      });
    }

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.pickupOtp.create({
      data: {
        otp,
        expiresAt,
        jobId,
        userId: job.userId,
      },
    });

    // DEV ONLY: log OTP
    if (process.env.NODE_ENV !== "production") {
      logger.debug({ jobId }, "PICKUP_OTP_GENERATED");
    }

    return res.status(200).json({
      message: "Pickup OTP generated",
    });
  })
);

// Vendor verifies pickup OTP and completes job
router.post(
  "/:id/verify-pickup",
  pickupLimiter,
  authGuard(["VENDOR"]),
  asyncHandler(async (req, res) => {
    logger.info("🔥 VERIFY PICKUP ROUTE HIT");

    const vendor = await prisma.vendor.findUnique({
      where: { id: req.auth!.id }
    });

    if (!vendor || !vendor.isActive) {
      return res.status(400).json({ error: "Invalid vendor" });
    }

    const jobId = String(req.params.id);

    // if (!jobId) {
    //   throw new AppError("Invalid job id", 400);
    // }

    const { otp } = req.body;

    if (typeof jobId !== "string" || typeof otp !== "string") {
      return res.status(400).json({ error: "Invalid request" });
    }

    const job = await prisma.printJob.findUnique({
      where: { id: jobId },
      include: {
        payment: true,
        pickupOtp: true,
      },
    });

    if (!job || job.vendorId !== req.auth!.id) {
      return res.status(404).json({ error: "Print job not found" });
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

    // 🔒 PAYMENT ENFORCEMENT
    if (
      payment.method === PaymentMethod.ONLINE &&
      payment.status !== PaymentStatus.PAID
    ) {
      return res.status(400).json({ error: "Online payment not completed" });
    }

    if (
      payment.method === PaymentMethod.OFFLINE &&
      payment.status !== PaymentStatus.PAID
    ) {
      return res.status(400).json({
        error: "Offline payment not confirmed by vendor",
      });
    }

    // 🔐 OTP VALIDATION
    const pickupOtp = await prisma.pickupOtp.findUnique({
      where: { jobId },
    });

    if (!pickupOtp) {
      return res.status(404).json({ error: "Pickup OTP not found" });
    }

    if (pickupOtp.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (pickupOtp.expiresAt < new Date()) {
      await prisma.pickupOtp.delete({ where: { id: pickupOtp.id } });
      return res.status(400).json({ error: "OTP expired" });
    }

    // ✅ COMPLETE JOB ATOMICALLY
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Complete job
      await tx.printJob.update({
        where: { id: jobId },
        data: { status: PrintJobStatus.COMPLETED },
      });

      // 🔍 AUDIT — JOB COMPLETED
      await tx.auditLog.create({
        data: {
          entityType: "PRINT_JOB",
          entityId: jobId,
          action: "COMPLETED",
          actorType: "VENDOR",
          actorId: vendor.id,
        },
      });

      // 2️⃣ Delete OTP
      await tx.pickupOtp.delete({
        where: { id: pickupOtp.id },
      });

      // 3️⃣ Create vendor earning ledger
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
  })
);

// Vendor sets price for a READY job
router.post(
  "/:id/set-price",
  pricingLimiter,
  authGuard(["VENDOR"]),
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.auth!.id }
    });

    if (!vendor || !vendor.isActive) {
      return res.status(400).json({ error: "Invalid vendor" });
    }

    const jobId = String(req.params.id);

    // if (!jobId) {
    //   throw new AppError("Invalid job id", 400);
    // }

    const { price } = req.body;

    if (typeof jobId !== "string" || typeof price !== "number" || price <= 0) {
      return res.status(400).json({ error: "Invalid price data" });
    }

    const job = await prisma.printJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        vendorId: true,
        status: true,
        price: true,
        copies: true,
        colorMode: true,
        paperSize: true,
        payment: true,
        pickupOtp: true,
      },
    });

    if (!job || job.vendorId !== req.auth!.id) {
      return res.status(404).json({ error: "Print job not found" });
    }

    if (job.status !== "PENDING") {
      return res.status(400).json({
        error: "Price can be set only for PENDING jobs",
      });
    }

    if (job.price !== null) {
      return res
        .status(400)
        .json({ error: "Price already set for this job" });
    }

    // price sanity checks FIRST

    const MIN_BW_A4 = 100;
    const MIN_COLOR_A4 = 300;

    const basePerCopy =
      job.colorMode === "COLOR" ? MIN_COLOR_A4 : MIN_BW_A4;

    const sizeMultiplier = job.paperSize === "A3" ? 2 : 1;

    const minExpected =
      basePerCopy * sizeMultiplier * job.copies;

    if (price < minExpected) {
      return res.status(400).json({
        error: "Price too low for selected print options",
        minExpected,
      });
    }

    const updatedJob = await prisma.printJob.update({
      where: { id: jobId },
      data: {
        price,
        pricedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: "Price set successfully",
      printJob: updatedJob,
    });
  })
);

// User accepts price for a READY job
router.post(
  "/:id/accept-price",
  authGuard(["USER"]),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.id }
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const jobId = String(req.params.id);

    // if (!jobId) {
    //   throw new AppError("Invalid job id", 400);
    // }

    // if (typeof jobId !== "string") {
    //   return res.status(400).json({ error: "Invalid job id" });
    // }

    const job = await prisma.printJob.findUnique({
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

    const updatedJob = await prisma.printJob.update({
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
  })
);

// User chooses payment method and creates payment intent
router.post(
  "/:id/pay",
  paymentLimiter,
  authGuard(["USER"]),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.id }
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const jobId = String(req.params.id);

    // if (!jobId) {
    //   throw new AppError("Invalid job id", 400);
    // }

    const { method, idempotencyKey } = req.body;

    if (!idempotencyKey) {
      return res.status(400).json({ error: "Idempotency key required" });
    }

    const updatedPayment = await prisma.$transaction(async (tx) => {
      // 1️⃣ Check existing payment by idempotency key
      const existing = await tx.payment.findUnique({
        where: { idempotencyKey },
      });

      if (existing) {
        return existing; // 🔁 safe retry
      }

      // 2️⃣ Lock job row
      const job = await tx.printJob.findUnique({
        where: { id: jobId },
        include: {
          payment: true,
          pickupOtp: true,
        },
      });

      if (!job || job.userId !== user.id) {
        throw new AppError("Job not found", 404);
      }

      const payment = job.payment;

      if (!job.priceAccepted) {
        throw new AppError("Price not accepted", 400);
      }

      if (payment) {
        return payment; // idempotent
      }

      // 3️⃣ Create payment exactly once
      const created = await tx.payment.create({
        data: {
          jobId: job.id,
          amount: job.price!,
          method,
          status: PaymentStatus.INITIATED,
          idempotencyKey,
        },
      });

      // 4️⃣ Audit (inside transaction)
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
  })
);

// Vendor confirms offline payment
router.post(
  "/:id/confirm-offline-payment",
  strictLimiter,
  authGuard(["VENDOR"]),
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.auth!.id }
    });

    if (!vendor || !vendor.isActive) {
      return res.status(400).json({ error: "Invalid vendor" });
    }

    const jobId = String(req.params.id);

    // if (!jobId) {
    //   throw new AppError("Invalid job id", 400);
    // }

    const job = await prisma.printJob.findUnique({
      where: { id: jobId },
      include: {
        payment: true,
        pickupOtp: true,
      },
    });

    if (!job || job.vendorId !== req.auth!.id) {
      return res.status(404).json({ error: "Print job not found" });
    }

    const payment = job.payment;

    if (!payment || payment.method !== PaymentMethod.OFFLINE) {
      return res.status(400).json({ error: "Offline payment not applicable" });
    }

    if (payment.status === PaymentStatus.FAILED) {
      return res.status(400).json({ error: "Payment already failed" });
    }

    if (payment.status === PaymentStatus.PAID) {
      return res.status(200).json({
        message: "Offline payment already confirmed",
        payment: payment,
      });
    }

    // ✅ only here do we mutate state
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        confirmedByVendorAt: new Date(),
      },
    });

    return res.status(200).json({
      message: "Offline payment confirmed",
      payment: updatedPayment,
    });
  })
);

//cancel
router.post(
  "/:id/cancel",
  strictLimiter,
  authGuard(["USER"]),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.id }
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const jobId = String(req.params.id);

    // if (!jobId) {
    //   throw new AppError("Invalid job id", 400);
    // }

    const job = await prisma.printJob.findUnique({
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

    if (!payment) {
      return res.status(400).json({ error: "Payment not created" });
    }

    if (job.status === PrintJobStatus.COMPLETED) {
      return res
        .status(400)
        .json({ error: "Completed job cannot be cancelled" });
    }

    if (job.pickupOtp) {
      return res
        .status(400)
        .json({ error: "Pickup already initiated" });
    }

    if (
      job.status !== PrintJobStatus.PENDING &&
      job.status !== PrintJobStatus.READY
    ) {
      return res.status(400).json({ error: "Job cannot be cancelled" });
    }

    if (job.fileUrl) {
      await supabase.storage
        .from(process.env.SUPABASE_STORAGE_BUCKET!)
        .remove([job.fileUrl]);
    }

    await prisma.$transaction(async (tx) => {
      // 💳 Payment handling
      if (payment.method === PaymentMethod.ONLINE) {
        if (payment.status === PaymentStatus.PAID) {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.REFUND_PENDING },
          });
        } else {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.CANCELLED },
          });
        }
      }

      if (payment.method === PaymentMethod.OFFLINE) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.CANCELLED },
        });
      }

      // 🧾 Cancel job
      await tx.printJob.update({
        where: { id: job.id },
        data: { status: PrintJobStatus.CANCELLED },
      });

      // 🔍 AUDIT — JOB CANCELLED
      await tx.auditLog.create({
        data: {
          entityType: "PRINT_JOB",
          entityId: job.id,
          action: "CANCELLED",
          actorType: "USER",
          actorId: user.id,
          metadata: {
            paymentStatus: payment.status,
            paymentMethod: payment.method,
          },
        },
      });
    });

    return res.status(200).json({
      message: "Job cancelled successfully",
    });
  })
);

//webhook/payment
router.post(
  "/webhook/payment",
  webhookAuth,
  asyncHandler(async (req, res) => {
    const { orderId, paymentId, status } = req.body;

    const payment = await prisma.payment.findFirst({
      where: { gatewayOrderId: orderId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (status === "success") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          gatewayPaymentId: paymentId,
          paidAt: new Date(),
        },
      });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: "Gateway failure",
        },
      });
    }

    await auditLog({
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
  })
);

//webhook/refund
router.post(
  "/webhook/refund",
  webhookAuth,
  asyncHandler(async (req, res) => {
    const { paymentId, refundId, status } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { job: true },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // 🔒 Idempotency
    if (payment.status === PaymentStatus.REFUNDED) {
      return res.status(200).json({ ok: true });
    }

    if (payment.status !== PaymentStatus.REFUND_PENDING) {
      return res.status(400).json({ error: "Invalid refund state" });
    }

    if (status === "success") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.REFUNDED,
          refundedAt: new Date(),
        },
      });
    } else {
      // refund failed → manual intervention
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          failureReason: "Refund failed at gateway",
        },
      });
    }

    await auditLog({
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
  })
);

// Admin settles vendor earnings
router.post(
  "/admin/vendors/:vendorId/settle",
  authGuard(["ADMIN"]),
  asyncHandler(async (req, res) => {

    const admin = await prisma.user.findUnique({
      where: { id: req.auth!.id }
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

    const unsettled = await prisma.vendorEarning.findMany({
      where: {
        vendorId,
        settledAt: null,
      },
    });

    if (unsettled.length === 0) {
      return res.status(400).json({ error: "No earnings to settle" });
    }

    const totalPayout = unsettled.reduce(
      (sum, e) => sum + e.netAmount,
      0
    );

    await prisma.$transaction(async (tx) => {
      for (const earning of unsettled) {
        assertUnsettled(earning);

        await tx.vendorEarning.update({
          where: { id: earning.id },
          data: {
            settledAt: new Date(),
            settlementRef,
          },
        });
      }

      // 🔍 AUDIT — VENDOR SETTLEMENT
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
  })
);

export default router;