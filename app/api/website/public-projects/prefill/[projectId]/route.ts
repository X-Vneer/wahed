import { PERMISSIONS } from "@/config"
import db from "@/lib/db"
import {
  initLocale,
  requirePermission,
  type DynamicRouteContext,
} from "@/utils"
import type { PublicProjectPrefillResponse } from "@/lib/types/public-project-prefill"
import { type NextRequest, NextResponse } from "next/server"

const SHORT_MAX = 240

function truncate(s: string | null | undefined, max: number): string | null {
  if (!s?.trim()) return null
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

function suggestedSlugFromTitleEn(nameEn: string): string {
  return nameEn
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
}

export async function GET(
  request: NextRequest,
  context: DynamicRouteContext<{ projectId: string }>
) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const { projectId } = await context.params

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        categories: { select: { id: true } },
        attachments: true,
        tasks: {
          select: {
            taskAttachments: {
              select: {
                fileUrl: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                additionalInfo: true,
              },
            },
          },
        },
        city: { select: { regionId: true } },
      },
    })

    if (!project) {
      return NextResponse.json(
        {
          error: t(
            "websiteCms.projects.publicProjectForm.errors.prefillProjectNotFound"
          ),
        },
        { status: 404 }
      )
    }

    const descAr = project.descriptionAr ?? null
    const descEn = project.descriptionEn ?? null

    const body: PublicProjectPrefillResponse = {
      projectId: project.id,
      titleAr: project.nameAr,
      titleEn: project.nameEn,
      descriptionAr: descAr,
      descriptionEn: descEn,
      shortDescriptionAr: truncate(descAr, SHORT_MAX),
      shortDescriptionEn: truncate(descEn, SHORT_MAX),
      cityId: project.cityId,
      regionId: project.city.regionId,
      area: project.area ?? null,
      deedNumber: project.deedNumber ?? null,
      googleMapsAddress: project.googleMapsAddress ?? null,
      // Internal Project.statusId points to ProjectStatus; PublicProject uses
      // PublicProjectStatus. Translate the system-row id; custom internal
      // statuses have no public counterpart, so leave null.
      statusId: project.statusId?.startsWith("project-status-")
        ? `public-${project.statusId}`
        : null,
      categoryIds: project.categories.map((c) => c.id),
      images: project.image ? [project.image] : [],
      // Project attachments + each task's final task attachments. Non-final task
      // attachments are excluded.
      attachments: (() => {
        const seen = new Set<string>()
        const out: Array<{
          fileUrl: string
          fileName: string | null
          fileType: string | null
          fileSize: number | null
        }> = []

        for (const a of project.attachments) {
          if (seen.has(a.fileUrl)) continue
          seen.add(a.fileUrl)
          out.push({
            fileUrl: a.fileUrl,
            fileName: a.fileName ?? null,
            fileType: a.fileType ?? null,
            fileSize: a.fileSize ?? null,
          })
        }

        for (const task of project.tasks) {
          for (const att of task.taskAttachments) {
            const isFinal =
              (att.additionalInfo as { isFinal?: boolean } | null)?.isFinal ===
              true
            if (!isFinal) continue
            if (seen.has(att.fileUrl)) continue
            seen.add(att.fileUrl)
            out.push({
              fileUrl: att.fileUrl,
              fileName: att.fileName ?? null,
              fileType: att.fileType ?? null,
              fileSize: att.fileSize ?? null,
            })
          }
        }

        return out
      })(),
      suggestedSlug: suggestedSlugFromTitleEn(project.nameEn) || "project",
    }

    return NextResponse.json(body)
  } catch (error) {
    console.error("Error loading public project prefill:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
