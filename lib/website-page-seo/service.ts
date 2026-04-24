import db from "@/lib/db"
import type { WebsiteSiteSettings } from "@/lib/generated/prisma/client"
import { emptyToNull } from "@/lib/helpers"
import type { WebsitePageSeoValues } from "@/lib/schemas/website-page-seo"
import {
  type WebsiteLocale,
  type WebsitePageSlug,
} from "@/lib/website-content/default-content"

type WebsitePageSeoRow = {
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
}

function toFormValues(row: WebsitePageSeoRow | null): WebsitePageSeoValues {
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
  locale: WebsiteLocale
): {
  metaTitle: string
  metaDescription: string
  keywords: string
  canonicalUrl: string
  ogImageUrl: string
  twitterHandle: string
  robotsAllowIndex: boolean
} {
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

export async function getPageSeoForEditor(slug: WebsitePageSlug) {
  const pageSeoRepo = db.websitePageSeo
  const [pageSeo, siteSettings] = await Promise.all([
    pageSeoRepo.findUnique({ where: { slug } }),
    db.websiteSiteSettings.findFirst({ orderBy: { createdAt: "asc" } }),
  ])

  const page = toFormValues(pageSeo)
  const fallback = siteSettings
    ? buildFallbackValues(siteSettings)
    : toFormValues(null)

  return { page, fallback }
}

export async function upsertPageSeo(
  slug: WebsitePageSlug,
  values: WebsitePageSeoValues
) {
  const pageSeoRepo = db.websitePageSeo
  await pageSeoRepo.upsert({
    where: { slug },
    create: {
      slug,
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
}

export async function getPageSeoWithFallback(
  slug: WebsitePageSlug,
  locale: WebsiteLocale
) {
  const { page, fallback } = await getPageSeoForEditor(slug)

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

  return pickByLocale(effective, locale)
}
