-- AlterTable
ALTER TABLE "PublicProject" DROP COLUMN IF EXISTS "currency",
DROP COLUMN IF EXISTS "paymentMethod";

-- CreateTable
CREATE TABLE "PublicProjectAttachment" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "additionalInfo" JSONB,
    "publicProjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicProjectAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PublicProjectAttachment" ADD CONSTRAINT "PublicProjectAttachment_publicProjectId_fkey" FOREIGN KEY ("publicProjectId") REFERENCES "PublicProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
