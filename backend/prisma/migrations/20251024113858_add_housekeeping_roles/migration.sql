-- AlterTable
ALTER TABLE "public"."Position" ADD COLUMN     "isHousekeeper" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isHousekeepingLead" BOOLEAN NOT NULL DEFAULT false;
