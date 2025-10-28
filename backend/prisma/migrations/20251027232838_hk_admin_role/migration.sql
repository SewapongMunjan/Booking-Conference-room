/*
  Warnings:

  - Made the column `status` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Room" ADD COLUMN     "maintenanceUntil" TIMESTAMP(3),
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
