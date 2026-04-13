-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "projectSlug" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'general';

-- CreateIndex
CREATE INDEX "ContactMessage_source_idx" ON "ContactMessage"("source");
