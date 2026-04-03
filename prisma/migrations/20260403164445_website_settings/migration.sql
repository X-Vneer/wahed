/*
  Warnings:

  - You are about to drop the column `borderRadius` on the `WebsiteSiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `colorMode` on the `WebsiteSiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `fontBody` on the `WebsiteSiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `fontHeading` on the `WebsiteSiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `siteNameAr` on the `WebsiteSiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `siteNameEn` on the `WebsiteSiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `taglineAr` on the `WebsiteSiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `taglineEn` on the `WebsiteSiteSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WebsiteSiteSettings" DROP COLUMN "borderRadius",
DROP COLUMN "colorMode",
DROP COLUMN "fontBody",
DROP COLUMN "fontHeading",
DROP COLUMN "siteNameAr",
DROP COLUMN "siteNameEn",
DROP COLUMN "taglineAr",
DROP COLUMN "taglineEn",
ADD COLUMN     "SecondaryTextColor" TEXT,
ADD COLUMN     "blackColor" TEXT,
ADD COLUMN     "fontAr" TEXT,
ADD COLUMN     "fontEn" TEXT;
