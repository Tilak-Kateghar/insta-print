-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PrintJobStatus" AS ENUM ('PENDING', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PrintColorMode" AS ENUM ('COLOR', 'BLACK_WHITE');

-- CreateEnum
CREATE TYPE "PaperSize" AS ENUM ('A4', 'A3');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "EarningStatus" AS ENUM ('PENDING', 'SETTLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOtp" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintJob" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "copies" INTEGER NOT NULL,
    "status" "PrintJobStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "colorMode" "PrintColorMode" NOT NULL DEFAULT 'BLACK_WHITE',
    "paperSize" "PaperSize" NOT NULL DEFAULT 'A4',
    "price" INTEGER,
    "pricedAt" TIMESTAMP(3),
    "priceAccepted" BOOLEAN NOT NULL DEFAULT false,
    "priceAcceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupOtp" (
    "id" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickupOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'ONLINE',
    "status" "PaymentStatus" NOT NULL DEFAULT 'INITIATED',
    "gatewayPaymentId" TEXT,
    "gatewayOrderId" TEXT,
    "failureReason" TEXT,
    "idempotencyKey" TEXT,
    "jobId" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "confirmedByVendorAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorEarning" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "grossAmount" INTEGER NOT NULL,
    "platformFee" INTEGER NOT NULL,
    "netAmount" INTEGER NOT NULL,
    "status" "EarningStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),
    "settlementRef" TEXT,

    CONSTRAINT "VendorEarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_phone_key" ON "Vendor"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserOtp_phone_key" ON "UserOtp"("phone");

-- CreateIndex
CREATE INDEX "UserOtp_phone_idx" ON "UserOtp"("phone");

-- CreateIndex
CREATE INDEX "PrintJob_userId_idx" ON "PrintJob"("userId");

-- CreateIndex
CREATE INDEX "PrintJob_vendorId_idx" ON "PrintJob"("vendorId");

-- CreateIndex
CREATE INDEX "PrintJob_status_idx" ON "PrintJob"("status");

-- CreateIndex
CREATE INDEX "PrintJob_createdAt_idx" ON "PrintJob"("createdAt");

-- CreateIndex
CREATE INDEX "PrintJob_vendorId_createdAt_idx" ON "PrintJob"("vendorId", "createdAt");

-- CreateIndex
CREATE INDEX "PrintJob_userId_createdAt_idx" ON "PrintJob"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PickupOtp_jobId_key" ON "PickupOtp"("jobId");

-- CreateIndex
CREATE INDEX "PickupOtp_jobId_idx" ON "PickupOtp"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_jobId_key" ON "Payment"("jobId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_jobId_idx" ON "Payment"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorEarning_jobId_key" ON "VendorEarning"("jobId");

-- CreateIndex
CREATE INDEX "VendorEarning_vendorId_idx" ON "VendorEarning"("vendorId");

-- CreateIndex
CREATE INDEX "VendorEarning_createdAt_idx" ON "VendorEarning"("createdAt");

-- CreateIndex
CREATE INDEX "VendorEarning_vendorId_createdAt_idx" ON "VendorEarning"("vendorId", "createdAt");

-- CreateIndex
CREATE INDEX "VendorEarning_vendorId_settledAt_idx" ON "VendorEarning"("vendorId", "settledAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupOtp" ADD CONSTRAINT "PickupOtp_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "PrintJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupOtp" ADD CONSTRAINT "PickupOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "PrintJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorEarning" ADD CONSTRAINT "VendorEarning_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorEarning" ADD CONSTRAINT "VendorEarning_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "PrintJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
