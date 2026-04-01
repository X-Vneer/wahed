-- CreateTable
CREATE TABLE "WebsitePageContent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsitePageContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebsitePageContent_slug_idx" ON "WebsitePageContent"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "WebsitePageContent_slug_locale_key" ON "WebsitePageContent"("slug", "locale");
