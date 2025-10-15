/*
  Warnings:

  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."NotifType" AS ENUM ('INVITE', 'APPROVED', 'REJECTED', 'CANCELED', 'RESCHEDULED', 'ISSUE_CREATED');

-- CreateEnum
CREATE TYPE "public"."RefType" AS ENUM ('BOOKING', 'INVITE', 'ISSUE');

-- DropIndex
DROP INDEX "public"."Notification_userId_idx";

-- AlterTable
ALTER TABLE "Notification"
  ADD COLUMN "type" "NotifType" NOT NULL DEFAULT 'INVITE',
  ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Notification',
  ADD COLUMN "refType" "RefType",
  ADD COLUMN "refId" INTEGER,
  ADD COLUMN "readAt" TIMESTAMP;

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "public"."Notification"("userId", "isRead", "createdAt");
