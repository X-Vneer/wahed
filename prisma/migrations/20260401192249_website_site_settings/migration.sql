-- CreateEnum
CREATE TYPE "WebsiteColorMode" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateTable
CREATE TABLE "WebsiteSiteSettings" (
    "id" TEXT NOT NULL,
    "colorMode" "WebsiteColorMode" NOT NULL DEFAULT 'SYSTEM',
    "primaryColor" TEXT,
    "accentColor" TEXT,
    "borderRadius" TEXT NOT NULL DEFAULT '0.5rem',
    "fontHeading" TEXT NOT NULL DEFAULT 'Inter',
    "fontBody" TEXT NOT NULL DEFAULT 'Inter',
    "logoForDarkBgUrl" TEXT,
    "logoForLightBgUrl" TEXT,
    "siteNameAr" TEXT NOT NULL DEFAULT '',
    "siteNameEn" TEXT NOT NULL DEFAULT '',
    "taglineAr" TEXT NOT NULL DEFAULT '',
    "taglineEn" TEXT NOT NULL DEFAULT '',
    "defaultMetaTitleAr" TEXT,
    "defaultMetaTitleEn" TEXT,
    "defaultMetaDescriptionAr" TEXT,
    "defaultMetaDescriptionEn" TEXT,
    "ogImageUrl" TEXT,
    "siteUrl" TEXT,
    "twitterSite" TEXT,
    "robotsAllowIndex" BOOLEAN NOT NULL DEFAULT true,
    "keywordsAr" TEXT,
    "keywordsEn" TEXT,
    "publicContactEmail" TEXT,
    "publicPhone" TEXT,
    "faviconUrl" TEXT,
    "googleAnalyticsMeasurementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteSiteSettings_pkey" PRIMARY KEY ("id")
);
