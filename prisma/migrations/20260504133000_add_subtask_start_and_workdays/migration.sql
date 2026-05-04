-- AlterTable
ALTER TABLE "SubTasks" ADD COLUMN     "estimatedWorkingDays" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TaskTemplateSubItem" ADD COLUMN     "estimatedWorkingDays" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3);
