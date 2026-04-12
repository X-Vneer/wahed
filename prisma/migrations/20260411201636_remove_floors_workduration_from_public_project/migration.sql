/*
  Warnings:

  - You are about to drop the column `numberOfFloors` on the `PublicProject` table. All the data in the column will be lost.
  - You are about to drop the column `workDuration` on the `PublicProject` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PublicProject" DROP COLUMN "numberOfFloors",
DROP COLUMN "workDuration";
