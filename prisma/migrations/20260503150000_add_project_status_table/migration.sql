-- Convert ProjectStatus from a Postgres enum to a configurable lookup table.
-- Order matters: rename old enum -> create new table -> seed system rows ->
-- add nullable FK columns -> backfill -> drop old enum columns + old enum type ->
-- add FK constraints. Rollback path is recoverable from statusId suffix.

ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";

CREATE TABLE "ProjectStatus" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectStatus_pkey" PRIMARY KEY ("id")
);

INSERT INTO "ProjectStatus" ("id", "nameAr", "nameEn", "color", "isSystem", "createdAt", "updatedAt") VALUES
    ('project-status-planning',    'التخطيط',     'Planning',    '#F59E0B', true, now(), now()),
    ('project-status-in-progress', 'قيد التنفيذ', 'In Progress', '#3B82F6', true, now(), now()),
    ('project-status-on-hold',     'متوقف',       'On Hold',     '#F97316', true, now(), now()),
    ('project-status-completed',   'منتهي',       'Completed',   '#8B5CF6', true, now(), now()),
    ('project-status-cancelled',   'ملغي',        'Cancelled',   '#EF4444', true, now(), now());

ALTER TABLE "Project"       ADD COLUMN "statusId" TEXT;
ALTER TABLE "PublicProject" ADD COLUMN "statusId" TEXT;

UPDATE "Project"       SET "statusId" = 'project-status-' || lower(replace("status"::text, '_', '-'));
UPDATE "PublicProject" SET "statusId" = 'project-status-' || lower(replace("status"::text, '_', '-'));

ALTER TABLE "Project"       DROP COLUMN "status";
ALTER TABLE "PublicProject" DROP COLUMN "status";
DROP TYPE "ProjectStatus_old";

ALTER TABLE "Project"
    ADD CONSTRAINT "Project_statusId_fkey" FOREIGN KEY ("statusId")
    REFERENCES "ProjectStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PublicProject"
    ADD CONSTRAINT "PublicProject_statusId_fkey" FOREIGN KEY ("statusId")
    REFERENCES "ProjectStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
