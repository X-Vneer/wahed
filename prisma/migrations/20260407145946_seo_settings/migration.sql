-- CreateTable
CREATE TABLE "WebsitePageSeo" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "metaTitleAr" TEXT,
    "metaTitleEn" TEXT,
    "metaDescriptionAr" TEXT,
    "metaDescriptionEn" TEXT,
    "canonicalUrl" TEXT,
    "ogImageUrl" TEXT,
    "twitterHandle" TEXT,
    "keywordsAr" TEXT,
    "keywordsEn" TEXT,
    "robotsAllowIndex" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsitePageSeo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebsitePageSeo_slug_key" ON "WebsitePageSeo"("slug");
