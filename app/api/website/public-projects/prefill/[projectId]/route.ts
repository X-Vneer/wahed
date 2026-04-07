import { PERMISSIONS } from "@/config"
import db from "@/lib/db"
import type { PublicProjectPrefillResponse } from "@/lib/types/public-project-prefill"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
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

type RouteContext = {
  params: Promise<{ projectId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { projectId } = await context.params

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        categories: { select: { id: true } },
        attachments: true,
        city: { select: { regionId: true } },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: t("websiteCms.projects.publicProjectForm.errors.prefillProjectNotFound") },
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
      numberOfFloors: project.numberOfFloors ?? null,
      deedNumber: project.deedNumber ?? null,
      workDuration: project.workDuration ?? null,
      googleMapsAddress: project.googleMapsAddress ?? null,
      status: project.status,
      categoryIds: project.categories.map((c) => c.id),
      images: project.image ? [project.image] : [],
      attachments: project.attachments.map((a) => ({
        fileUrl: a.fileUrl,
        fileName: a.fileName ?? null,
        fileType: a.fileType ?? null,
        fileSize: a.fileSize ?? null,
      })),
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
