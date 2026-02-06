/*
  Warnings:

  - The values [TASK_ARCHIVE,TASK_UNARCHIVE,TASK_COMPLETE] on the enum `PermissionKey` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PermissionKey_new" AS ENUM ('PROJECT_CREATE', 'PROJECT_UPDATE', 'PROJECT_DELETE', 'PROJECT_VIEW', 'PROJECT_ARCHIVE', 'PROJECT_UNARCHIVE', 'TASK_CREATE', 'TASK_UPDATE', 'TASK_DELETE', 'TASK_ASSIGN', 'TASK_VIEW', 'FILE_UPLOAD', 'FILE_DELETE', 'STAFF_MANAGEMENT', 'LIST_CREATE', 'LIST_DELETE', 'LIST_UPDATE', 'WEBSITE_MANAGEMENT', 'REPORT_VIEW', 'REPORT_EXPORT', 'STAFF_PAGE_MANAGEMENT');
ALTER TABLE "Permission" ALTER COLUMN "key" TYPE "PermissionKey_new" USING ("key"::text::"PermissionKey_new");
ALTER TYPE "PermissionKey" RENAME TO "PermissionKey_old";
ALTER TYPE "PermissionKey_new" RENAME TO "PermissionKey";
DROP TYPE "public"."PermissionKey_old";
COMMIT;
