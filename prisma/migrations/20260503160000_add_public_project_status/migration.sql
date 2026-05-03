-- Split PublicProject status from ProjectStatus into its own configurable table.
-- Existing PublicProject.statusId values point to ProjectStatus rows
-- (project-status-*) after the previous migration; we translate those ids to
-- public-project-status-* and rebind the FK to the new table.

-- 1. Drop the old FK pointing to ProjectStatus.
ALTER TABLE "PublicProject" DROP CONSTRAINT IF EXISTS "PublicProject_statusId_fkey";

-- 2. Create the new table.
CREATE TABLE "PublicProjectStatus" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicProjectStatus_pkey" PRIMARY KEY ("id")
);

-- 3. Seed the 5 system rows so the FK rebind below has targets.
INSERT INTO "PublicProjectStatus" ("id", "nameAr", "nameEn", "color", "isSystem", "createdAt", "updatedAt") VALUES
    ('public-project-status-planning',    'التخطيط',     'Planning',    '#F59E0B', true, now(), now()),
    ('public-project-status-in-progress', 'قيد التنفيذ', 'In Progress', '#3B82F6', true, now(), now()),
    ('public-project-status-on-hold',     'متوقف',       'On Hold',     '#F97316', true, now(), now()),
    ('public-project-status-completed',   'منتهي',       'Completed',   '#8B5CF6', true, now(), now()),
    ('public-project-status-cancelled',   'ملغي',        'Cancelled',   '#EF4444', true, now(), now());

-- 4. Translate existing PublicProject.statusId from project-status-* to public-project-status-*.
UPDATE "PublicProject"
SET "statusId" = 'public-' || "statusId"
WHERE "statusId" IS NOT NULL AND "statusId" LIKE 'project-status-%';

-- 5. Rebind the FK to the new table.
ALTER TABLE "PublicProject"
    ADD CONSTRAINT "PublicProject_statusId_fkey" FOREIGN KEY ("statusId")
    REFERENCES "PublicProjectStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
