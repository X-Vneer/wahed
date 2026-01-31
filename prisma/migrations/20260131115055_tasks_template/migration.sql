-- CreateTable
CREATE TABLE "TaskTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "estimatedWorkingDays" INTEGER,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "defaultStatusId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTemplateSubItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "taskTemplateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskTemplateSubItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TaskCategoryToTaskTemplate" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaskCategoryToTaskTemplate_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaskCategoryToTaskTemplate_B_index" ON "_TaskCategoryToTaskTemplate"("B");

-- AddForeignKey
ALTER TABLE "TaskTemplate" ADD CONSTRAINT "TaskTemplate_defaultStatusId_fkey" FOREIGN KEY ("defaultStatusId") REFERENCES "TaskStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTemplateSubItem" ADD CONSTRAINT "TaskTemplateSubItem_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "TaskTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskCategoryToTaskTemplate" ADD CONSTRAINT "_TaskCategoryToTaskTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "TaskCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskCategoryToTaskTemplate" ADD CONSTRAINT "_TaskCategoryToTaskTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "TaskTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
