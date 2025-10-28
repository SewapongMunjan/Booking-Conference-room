/*
  Warnings:

  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Issue" DROP CONSTRAINT "Issue_roomId_fkey";

-- DropTable
DROP TABLE "public"."Room";

-- AddForeignKey
ALTER TABLE "public"."Issue" ADD CONSTRAINT "Issue_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."MeetingRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
