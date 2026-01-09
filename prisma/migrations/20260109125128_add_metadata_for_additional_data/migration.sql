/*
  Warnings:

  - Added the required column `type` to the `ProjectAdditionalData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectAdditionalData" ADD COLUMN     "max" DOUBLE PRECISION,
ADD COLUMN     "maxDate" TIMESTAMP(3),
ADD COLUMN     "maxTime" TIMESTAMP(3),
ADD COLUMN     "min" DOUBLE PRECISION,
ADD COLUMN     "minDate" TIMESTAMP(3),
ADD COLUMN     "minTime" TIMESTAMP(3),
ADD COLUMN     "options" JSONB,
ADD COLUMN     "placeholder" TEXT,
ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" TEXT NOT NULL;
