-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PermissionKey" ADD VALUE 'PROJECT_VIEW';
ALTER TYPE "PermissionKey" ADD VALUE 'PROJECT_ARCHIVE';
ALTER TYPE "PermissionKey" ADD VALUE 'PROJECT_UNARCHIVE';
ALTER TYPE "PermissionKey" ADD VALUE 'TASK_VIEW';
ALTER TYPE "PermissionKey" ADD VALUE 'TASK_ARCHIVE';
ALTER TYPE "PermissionKey" ADD VALUE 'TASK_UNARCHIVE';
ALTER TYPE "PermissionKey" ADD VALUE 'TASK_COMPLETE';
ALTER TYPE "PermissionKey" ADD VALUE 'STAFF_MANAGEMENT';
ALTER TYPE "PermissionKey" ADD VALUE 'LIST_CREATE';
ALTER TYPE "PermissionKey" ADD VALUE 'LIST_DELETE';
ALTER TYPE "PermissionKey" ADD VALUE 'LIST_UPDATE';
ALTER TYPE "PermissionKey" ADD VALUE 'WEBSITE_MANAGEMENT';
ALTER TYPE "PermissionKey" ADD VALUE 'REPORT_VIEW';
ALTER TYPE "PermissionKey" ADD VALUE 'REPORT_EXPORT';
