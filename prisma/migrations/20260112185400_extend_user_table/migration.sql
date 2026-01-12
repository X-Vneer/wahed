/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Event` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "isPublic";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'MALE',
ADD COLUMN     "image" TEXT,
ADD COLUMN     "nationality" TEXT;
