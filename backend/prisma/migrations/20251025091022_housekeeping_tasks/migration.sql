-- CreateEnum
CREATE TYPE "public"."HousekeepingTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."HousekeepingTask" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "status" "public"."HousekeepingTaskStatus" NOT NULL DEFAULT 'PENDING',
    "assignedToId" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HousekeepingTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HousekeepingTask_status_idx" ON "public"."HousekeepingTask"("status");

-- CreateIndex
CREATE INDEX "HousekeepingTask_assignedToId_idx" ON "public"."HousekeepingTask"("assignedToId");

-- CreateIndex
CREATE INDEX "HousekeepingTask_bookingId_idx" ON "public"."HousekeepingTask"("bookingId");

-- CreateIndex
CREATE INDEX "HousekeepingTask_serviceId_idx" ON "public"."HousekeepingTask"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "HousekeepingTask_bookingId_serviceId_key" ON "public"."HousekeepingTask"("bookingId", "serviceId");

-- AddForeignKey
ALTER TABLE "public"."HousekeepingTask" ADD CONSTRAINT "HousekeepingTask_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HousekeepingTask" ADD CONSTRAINT "HousekeepingTask_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HousekeepingTask" ADD CONSTRAINT "HousekeepingTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
