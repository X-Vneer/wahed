-- AlterEnum
ALTER TYPE "PermissionKey" ADD VALUE 'SYSTEM_SETTINGS_MANAGEMENT';

-- CreateTable
CREATE TABLE "SystemSiteSettings" (
    "id" TEXT NOT NULL,
    "systemNameAr" TEXT,
    "systemNameEn" TEXT,
    "logoForDarkBgUrl" TEXT,
    "logoForLightBgUrl" TEXT,
    "logoSquareUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT,
    "accentColor" TEXT,
    "sidebarVariant" TEXT DEFAULT 'light',
    "defaultLocale" TEXT DEFAULT 'en',
    "loginBackgroundUrl" TEXT,
    "loginWelcomeTitleAr" TEXT,
    "loginWelcomeTitleEn" TEXT,
    "loginSubtitleAr" TEXT,
    "loginSubtitleEn" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSiteSettings_pkey" PRIMARY KEY ("id")
);
