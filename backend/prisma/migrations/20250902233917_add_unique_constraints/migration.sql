/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roomName]` on the table `MeetingRoom` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `NoteTakerQueue` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Position` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "public"."Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingRoom_roomName_key" ON "public"."MeetingRoom"("roomName");

-- CreateIndex
CREATE UNIQUE INDEX "NoteTakerQueue_userId_key" ON "public"."NoteTakerQueue"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Position_name_key" ON "public"."Position"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "public"."Service"("name");
