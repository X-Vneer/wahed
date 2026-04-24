import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import type { WebsiteSiteSettings } from "@/lib/generated/prisma/client"
import { initLocale, type DynamicRouteContext } from "@/lib/helpers"
import { websiteContentLocaleSchema } from "@/lib/schemas/website-content"
import type { WebsitePageSeoValues } from "@/lib/schemas/website-page-seo"
import { transformZodError } from "@/lib/transform-errors"

function projectSeoSlug(projectSlug: string) {
  return `project/${projectSlug}`
}

function toValues(
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

function pickByLocale(
  values: WebsitePageSeoValues,
  locale: "ar" | "en"
) {
  return {
    metaTitle: locale === "ar" ? values.metaTitleAr : values.metaTitleEn,
    metaDescription:
      locale === "ar" ? values.metaDescriptionAr : values.metaDescriptionEn,
    keywords: locale === "ar" ? values.keywordsAr : values.keywordsEn,
    canonicalUrl: values.canonicalUrl,
    ogImageUrl: values.ogImageUrl,
    twitterHandle: values.twitterHandle,
    robotsAllowIndex: values.robotsAllowIndex,
  }
}

export async function GET(
  request: NextRequest,
  context: DynamicRouteContext<{ slug: string }>
) {
  const { locale, t } = await initLocale(request)

  try {
    const { slug } = await context.params

    // Validate the project slug exists
    const project = await db.publicProject.findUnique({
      where: { slug },
      select: { slug: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      )
    }

    const localeParam = request.nextUrl.searchParams.get("locale")
    const localeResult = websiteContentLocaleSchema.safeParse(
      localeParam ?? locale
    )
    if (!localeResult.success) {
      return NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(localeResult.error),
        },
        { status: 400 }
      )
    }

    const seoSlug = projectSeoSlug(project.slug)

    const [pageSeo, siteSettings] = await Promise.all([
      db.websitePageSeo.findUnique({ where: { slug: seoSlug } }),
      db.websiteSiteSettings.findFirst({ orderBy: { createdAt: "asc" } }),
    ])

    const page = toValues(pageSeo)
    const fallback = siteSettings
      ? buildFallbackValues(siteSettings)
      : toValues(null)

    // Merge: page values win, fall back to site defaults
    const effective: WebsitePageSeoValues = {
      metaTitleAr: page.metaTitleAr || fallback.metaTitleAr,
      metaTitleEn: page.metaTitleEn || fallback.metaTitleEn,
      metaDescriptionAr: page.metaDescriptionAr || fallback.metaDescriptionAr,
      metaDescriptionEn: page.metaDescriptionEn || fallback.metaDescriptionEn,
      canonicalUrl: page.canonicalUrl || fallback.canonicalUrl,
      ogImageUrl: page.ogImageUrl || fallback.ogImageUrl,
      twitterHandle: page.twitterHandle || fallback.twitterHandle,
      keywordsAr: page.keywordsAr || fallback.keywordsAr,
      keywordsEn: page.keywordsEn || fallback.keywordsEn,
      robotsAllowIndex: page.robotsAllowIndex,
    }

    const seo = pickByLocale(effective, localeResult.data as "ar" | "en")

    return NextResponse.json({ slug, locale: localeResult.data, seo })
  } catch (error) {
    console.error("Error fetching public project SEO:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
