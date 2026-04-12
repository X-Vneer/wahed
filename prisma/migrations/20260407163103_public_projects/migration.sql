-- AlterTable
ALTER TABLE "ProjectCategory" ADD COLUMN     "publicProjectsId" TEXT;

-- CreateTable
CREATE TABLE "PublicProject" (
    "id" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "shortDescriptionAr" TEXT,
    "shortDescriptionEn" TEXT,
    "images" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "projectId" TEXT,
    "locationAr" TEXT,
    "locationEn" TEXT,
    "area" DOUBLE PRECISION,
    "numberOfFloors" INTEGER,
    "deedNumber" TEXT,
    "workDuration" INTEGER,
    "googleMapsAddress" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "cityId" TEXT NOT NULL,
    "startingPrice" DOUBLE PRECISION,
    "endingPrice" DOUBLE PRECISION,
    "currency" TEXT,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicProjectBadge" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicProjectBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicProjectFeature" (
    "id" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "valueAr" TEXT,
    "valueEn" TEXT,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicProjectFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PublicProjectToPublicProjectBadge" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PublicProjectToPublicProjectBadge_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PublicProjectToPublicProjectFeature" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PublicProjectToPublicProjectFeature_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicProject_slug_key" ON "PublicProject"("slug");

-- CreateIndex
CREATE INDEX "_PublicProjectToPublicProjectBadge_B_index" ON "_PublicProjectToPublicProjectBadge"("B");

-- CreateIndex
CREATE INDEX "_PublicProjectToPublicProjectFeature_B_index" ON "_PublicProjectToPublicProjectFeature"("B");

-- AddForeignKey
ALTER TABLE "ProjectCategory" ADD CONSTRAINT "ProjectCategory_publicProjectsId_fkey" FOREIGN KEY ("publicProjectsId") REFERENCES "PublicProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicProject" ADD CONSTRAINT "PublicProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicProject" ADD CONSTRAINT "PublicProject_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublicProjectToPublicProjectBadge" ADD CONSTRAINT "_PublicProjectToPublicProjectBadge_A_fkey" FOREIGN KEY ("A") REFERENCES "PublicProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublicProjectToPublicProjectBadge" ADD CONSTRAINT "_PublicProjectToPublicProjectBadge_B_fkey" FOREIGN KEY ("B") REFERENCES "PublicProjectBadge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublicProjectToPublicProjectFeature" ADD CONSTRAINT "_PublicProjectToPublicProjectFeature_A_fkey" FOREIGN KEY ("A") REFERENCES "PublicProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublicProjectToPublicProjectFeature" ADD CONSTRAINT "_PublicProjectToPublicProjectFeature_B_fkey" FOREIGN KEY ("B") REFERENCES "PublicProjectFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
