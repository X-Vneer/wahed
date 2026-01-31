/*
  Warnings:

  - You are about to drop the column `done` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "done",
DROP COLUMN "dueDate",
ADD COLUMN     "startedAt" TIMESTAMP(3);
