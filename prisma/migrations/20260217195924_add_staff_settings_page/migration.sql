-- CreateTable
CREATE TABLE "StaffPageSettings" (
    "id" TEXT NOT NULL,
    "heroBackgroundImageUrl" TEXT,
    "attendanceLink" TEXT NOT NULL DEFAULT '/attendance',
    "accountingLink" TEXT NOT NULL DEFAULT '/accounting',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffPageSettings_pkey" PRIMARY KEY ("id")
);
