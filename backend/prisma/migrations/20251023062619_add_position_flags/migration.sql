-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Position" ADD COLUMN     "isNoteManager" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."NoteTakerLeave" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteTakerLeave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NoteTakerLeave_userId_date_idx" ON "public"."NoteTakerLeave"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "NoteTakerLeave_userId_date_key" ON "public"."NoteTakerLeave"("userId", "date");

-- CreateIndex
CREATE INDEX "BookingInvite_userId_idx" ON "public"."BookingInvite"("userId");

-- CreateIndex
CREATE INDEX "BookingInvite_bookingId_status_idx" ON "public"."BookingInvite"("bookingId", "status");

-- CreateIndex
CREATE INDEX "BookingNoteTaker_userId_idx" ON "public"."BookingNoteTaker"("userId");

-- CreateIndex
CREATE INDEX "BookingNoteTaker_bookingId_status_idx" ON "public"."BookingNoteTaker"("bookingId", "status");

-- CreateIndex
CREATE INDEX "BookingRequiredPosition_bookingId_idx" ON "public"."BookingRequiredPosition"("bookingId");

-- CreateIndex
CREATE INDEX "BookingRequiredPosition_positionId_idx" ON "public"."BookingRequiredPosition"("positionId");

-- CreateIndex
CREATE INDEX "BookingService_bookingId_idx" ON "public"."BookingService"("bookingId");

-- CreateIndex
CREATE INDEX "BookingService_serviceId_status_idx" ON "public"."BookingService"("serviceId", "status");

-- CreateIndex
CREATE INDEX "NoteTakerQueue_isActive_orderNo_idx" ON "public"."NoteTakerQueue"("isActive", "orderNo");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NoteTakerLeave" ADD CONSTRAINT "NoteTakerLeave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
