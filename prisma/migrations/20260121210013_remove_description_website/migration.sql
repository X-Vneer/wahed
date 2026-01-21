/*
  Warnings:

  - You are about to drop the column `descriptionAr` on the `Website` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionEn` on the `Website` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Website" DROP COLUMN "descriptionAr",
DROP COLUMN "descriptionEn";
