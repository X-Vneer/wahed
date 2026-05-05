import { NextRequest, NextResponse } from "next/server"
import { PERMISSIONS } from "@/config"
import db from "@/lib/db"
import type { WebsiteSiteSettings } from "@/lib/generated/prisma/client"
import {
  emptyToNull,
  initLocale,
  requirePermission,
  validateRequest,
  type DynamicRouteContext,
} from "@/lib/helpers"
import {
  websitePageSeoSchema,
  type WebsitePageSeoValues,
} from "@/schemas/website-page-seo"

/** Convention: per-project SEO rows use slug = `project/{publicProject.slug}` */
function projectSeoSlug(projectSlug: string) {
  return `project/${projectSlug}`
}

function toFormValues(
  row: {
    metaTitleAr: string | null
    metaTitleEn: string | null
    metaDescriptionAr: string | null
    metaDescriptionEn: string | null
    canonicalUrl: string | null
    ogImageUrl: string | null
    twitterHandle: string | null
    keywordsAr: string | null
    keywordsEn: string | null
    robotsAllowIndex: boolean | null
  } | null
): WebsitePageSeoValues {
  return {
    metaTitleAr: row?.metaTitleAr ?? "",
    metaTitleEn: row?.metaTitleEn ?? "",
    metaDescriptionAr: row?.metaDescriptionAr ?? "",
    metaDescriptionEn: row?.metaDescriptionEn ?? "",
    canonicalUrl: row?.canonicalUrl ?? "",
    ogImageUrl: row?.ogImageUrl ?? "",
    twitterHandle: row?.twitterHandle ?? "",
    keywordsAr: row?.keywordsAr ?? "",
    keywordsEn: row?.keywordsEn ?? "",
    robotsAllowIndex: row?.robotsAllowIndex ?? true,
  }
}

function buildFallbackValues(
  siteSettings: WebsiteSiteSettings
): WebsitePageSeoValues {
  return {
    metaTitleAr: siteSettings.defaultMetaTitleAr ?? "",
    metaTitleEn: siteSettings.defaultMetaTitleEn ?? "",
    metaDescriptionAr: siteSettings.defaultMetaDescriptionAr ?? "",
    metaDescriptionEn: siteSettings.defaultMetaDescriptionEn ?? "",
    canonicalUrl: siteSettings.siteUrl ?? "",
    ogImageUrl: siteSettings.ogImageUrl ?? "",
    twitterHandle: siteSettings.twitterSite ?? "",
    keywordsAr: siteSettings.keywordsAr ?? "",
    keywordsEn: siteSettings.keywordsEn ?? "",
    robotsAllowIndex: siteSettings.robotsAllowIndex,
  }
}

export async function GET(
  request: NextRequest,
  context: DynamicRouteContext<{ id: string }>
) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const { id } = await context.params

    const project = await db.publicProject.findUnique({
      where: { id },
      select: { slug: true },
    })

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const seoSlug = projectSeoSlug(project.slug)

    const [pageSeo, siteSettings] = await Promise.all([
      db.websitePageSeo.findUnique({ where: { slug: seoSlug } }),
      db.websiteSiteSettings.findFirst({ orderBy: { createdAt: "asc" } }),
    ])

    const page = toFormValues(pageSeo)
    const fallback = siteSettings
      ? buildFallbackValues(siteSettings)
      : toFormValues(null)

    return NextResponse.json({ page, fallback })
  } catch (error) {
    console.error("Error fetching project SEO:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: DynamicRouteContext<{ id: string }>
) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const { id } = await context.params

    const project = await db.publicProject.findUnique({
      where: { id },
      select: { slug: true },
    })

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()
    const validation = validateRequest(websitePageSeoSchema, body, t)
    if (validation.error) return validation.error

    const values = validation.data
    const seoSlug = projectSeoSlug(project.slug)

    await db.websitePageSeo.upsert({
      where: { slug: seoSlug },
      create: {
        slug: seoSlug,
        metaTitleAr: emptyToNull(values.metaTitleAr),
        metaTitleEn: emptyToNull(values.metaTitleEn),
        metaDescriptionAr: emptyToNull(values.metaDescriptionAr),
        metaDescriptionEn: emptyToNull(values.metaDescriptionEn),
        canonicalUrl: emptyToNull(values.canonicalUrl),
        ogImageUrl: emptyToNull(values.ogImageUrl),
        twitterHandle: emptyToNull(values.twitterHandle),
        keywordsAr: emptyToNull(values.keywordsAr),
        keywordsEn: emptyToNull(values.keywordsEn),
        robotsAllowIndex: values.robotsAllowIndex,
      },
      update: {
        metaTitleAr: emptyToNull(values.metaTitleAr),
        metaTitleEn: emptyToNull(values.metaTitleEn),
        metaDescriptionAr: emptyToNull(values.metaDescriptionAr),
        metaDescriptionEn: emptyToNull(values.metaDescriptionEn),
        canonicalUrl: emptyToNull(values.canonicalUrl),
        ogImageUrl: emptyToNull(values.ogImageUrl),
        twitterHandle: emptyToNull(values.twitterHandle),
        keywordsAr: emptyToNull(values.keywordsAr),
        keywordsEn: emptyToNull(values.keywordsEn),
        robotsAllowIndex: values.robotsAllowIndex,
      },
    })

    return NextResponse.json({ message: t("common.saved") })
  } catch (error) {
    console.error("Error updating project SEO:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
