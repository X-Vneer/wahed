import db from "@/lib/db"
import {
  type Prisma,
  type WebsiteSiteSettings,
} from "@/lib/generated/prisma/client"
import type { UpdateWebsiteSiteSettingsInput } from "@/lib/schemas/website-site-settings"

const DEFAULT_CREATE: Prisma.WebsiteSiteSettingsCreateInput = {
  primaryColor: "#0f172a" as string | null,
  accentColor: "#2563eb" as string | null,

  fontAr: "Inter",
  fontEn: "Inter",

  defaultMetaTitleAr: "لوحة تحكم النظام الداخلي",
  defaultMetaTitleEn: "Internal System Dashboard",
}

/** CSS `font-family` value: quoted single name or pass-through stack. */
function cssFontFamily(value: string | null | undefined): string {
  const v = value?.trim()
  if (!v) return "sans-serif"
  if (v.includes(",")) return v
  return `"${v.replace(/"/g, '\\"')}", sans-serif`
}

/** Google Fonts CSS2 URL for simple family names (weights 300–700), or null if none. */
function googleFontsCss2Href(familyNames: string[]): string | null {
  const unique = [
    ...new Set(
      familyNames
        .map((n) => n.trim())
        .filter(Boolean)
        .filter((n) => !n.includes(","))
    ),
  ]
  if (unique.length === 0) return null
  const q = unique
    .map((name) => {
      const enc = encodeURIComponent(name).replace(/%20/g, "+")
      return `family=${enc}:wght@300;400;500;600;700`
    })
    .join("&")
  return `https://fonts.googleapis.com/css2?${q}&display=swap`
}

export type WebsiteSiteSettingsAdminDto = {
  primaryColor: string | null
  accentColor: string | null
  blackColor: string | null
  secondaryTextColor: string | null

  fontAr: string | null
  fontEn: string | null

  logoForDarkBgUrl: string | null
  logoForLightBgUrl: string | null
  defaultMetaTitleAr: string | null
  defaultMetaTitleEn: string | null
  defaultMetaDescriptionAr: string | null
  defaultMetaDescriptionEn: string | null
  ogImageUrl: string | null
  siteUrl: string | null
  twitterSite: string | null
  robotsAllowIndex: boolean
  keywordsAr: string | null
  keywordsEn: string | null
  publicContactEmail: string | null
  publicPhone: string | null
  faviconUrl: string | null
  googleAnalyticsMeasurementId: string | null

  facebookUrl: string | null
  instagramUrl: string | null
  youtubeUrl: string | null
  xUrl: string | null

  footerDescriptionAr: string | null
  footerDescriptionEn: string | null
}

function rowToAdminDto(row: WebsiteSiteSettings): WebsiteSiteSettingsAdminDto {
  return {
    primaryColor: row.primaryColor,
    accentColor: row.accentColor,
    blackColor: row.blackColor,
    secondaryTextColor: row.secondaryTextColor,
    fontAr: row.fontAr,
    fontEn: row.fontEn,

    logoForDarkBgUrl: row.logoForDarkBgUrl,
    logoForLightBgUrl: row.logoForLightBgUrl,
    defaultMetaTitleAr: row.defaultMetaTitleAr,
    defaultMetaTitleEn: row.defaultMetaTitleEn,
    defaultMetaDescriptionAr: row.defaultMetaDescriptionAr,
    defaultMetaDescriptionEn: row.defaultMetaDescriptionEn,
    ogImageUrl: row.ogImageUrl,
    siteUrl: row.siteUrl,
    twitterSite: row.twitterSite,
    robotsAllowIndex: row.robotsAllowIndex,
    keywordsAr: row.keywordsAr,
    keywordsEn: row.keywordsEn,
    publicContactEmail: row.publicContactEmail,
    publicPhone: row.publicPhone,
    faviconUrl: row.faviconUrl,
    googleAnalyticsMeasurementId: row.googleAnalyticsMeasurementId,

    facebookUrl: row.facebookUrl,
    instagramUrl: row.instagramUrl,
    youtubeUrl: row.youtubeUrl,
    xUrl: row.xUrl,

    footerDescriptionAr: row.footerDescriptionAr,
    footerDescriptionEn: row.footerDescriptionEn,
  }
}

export async function getOrCreateWebsiteSiteSettings(): Promise<WebsiteSiteSettings> {
  const existing = await db.websiteSiteSettings.findFirst({
    orderBy: { createdAt: "asc" },
  })
  if (existing) return existing

  return db.websiteSiteSettings.create({
    data: { ...DEFAULT_CREATE },
  })
}

export async function getWebsiteSiteSettingsAdmin(): Promise<WebsiteSiteSettingsAdminDto> {
  const row = await getOrCreateWebsiteSiteSettings()
  return rowToAdminDto(row)
}

function emptyToNull(value: string): string | null {
  if (value === "" || value == null) return null
  return value
}

export async function patchWebsiteSiteSettings(
  input: UpdateWebsiteSiteSettingsInput
): Promise<WebsiteSiteSettingsAdminDto> {
  const current = await getOrCreateWebsiteSiteSettings()

  const data: Prisma.WebsiteSiteSettingsUpdateInput = {
    primaryColor: emptyToNull(input.primaryColor),
    accentColor: emptyToNull(input.accentColor),
    blackColor: emptyToNull(input.blackColor),
    secondaryTextColor: emptyToNull(input.secondaryTextColor),
    fontAr: input.fontAr.trim() || null,
    fontEn: input.fontEn.trim() || null,
    logoForDarkBgUrl: emptyToNull(input.logoForDarkBgUrl),
    logoForLightBgUrl: emptyToNull(input.logoForLightBgUrl),
    defaultMetaTitleAr: emptyToNull(input.defaultMetaTitleAr),
    defaultMetaTitleEn: emptyToNull(input.defaultMetaTitleEn),
    defaultMetaDescriptionAr: emptyToNull(input.defaultMetaDescriptionAr),
    defaultMetaDescriptionEn: emptyToNull(input.defaultMetaDescriptionEn),
    ogImageUrl: emptyToNull(input.ogImageUrl),
    siteUrl: emptyToNull(input.siteUrl),
    twitterSite: emptyToNull(input.twitterSite),
    robotsAllowIndex: input.robotsAllowIndex,
    keywordsAr: emptyToNull(input.keywordsAr),
    keywordsEn: emptyToNull(input.keywordsEn),
    publicContactEmail: emptyToNull(input.publicContactEmail),
    publicPhone: emptyToNull(input.publicPhone),
    faviconUrl: emptyToNull(input.faviconUrl),
    googleAnalyticsMeasurementId: emptyToNull(
      input.googleAnalyticsMeasurementId
    ),
    facebookUrl: emptyToNull(input.facebookUrl),
    instagramUrl: emptyToNull(input.instagramUrl),
    youtubeUrl: emptyToNull(input.youtubeUrl),
    xUrl: emptyToNull(input.xUrl),
    footerDescriptionAr: emptyToNull(input.footerDescriptionAr),
    footerDescriptionEn: emptyToNull(input.footerDescriptionEn),
  }

  const updated = await db.websiteSiteSettings.update({
    where: { id: current.id },
    data,
  })

  return rowToAdminDto(updated)
}

export type PublicWebsiteSettingsLocale = "ar" | "en"

export function toPublicWebsiteSettings(
  row: WebsiteSiteSettings,
  locale: PublicWebsiteSettingsLocale
) {
  const defaultMetaTitle =
    locale === "ar" ? row.defaultMetaTitleAr : row.defaultMetaTitleEn
  const defaultMetaDescription =
    locale === "ar"
      ? row.defaultMetaDescriptionAr
      : row.defaultMetaDescriptionEn
  const keywords = locale === "ar" ? row.keywordsAr : row.keywordsEn

  const fontArCss = cssFontFamily(row.fontAr)
  const fontEnCss = cssFontFamily(row.fontEn)
  const familyResolved = locale === "ar" ? fontArCss : fontEnCss
  const googleFontsCssHref = googleFontsCss2Href([
    row.fontAr ?? "",
    row.fontEn ?? "",
  ])

  return {
    locale,
    theme: {
      primaryColor: row.primaryColor,
      accentColor: row.accentColor,
      blackColor: row.blackColor,
      secondaryTextColor: row.secondaryTextColor,
    },
    fonts: {
      /** CSS `font-family` for Arabic */
      fontAr: fontArCss,
      /** CSS `font-family` for English */
      fontEn: fontEnCss,
      /** Resolved `font-family` for the requested locale */
      family: familyResolved,
      /** When set, add `<link rel="stylesheet" href="…" />` for Google Fonts (weights 300–700). */
      googleFontsCssHref,
    },
    logos: {
      forDarkBackground: row.logoForDarkBgUrl,
      forLightBackground: row.logoForLightBgUrl,
    },
    seo: {
      defaultMetaTitle,
      defaultMetaDescription,
      ogImageUrl: row.ogImageUrl,
      siteUrl: row.siteUrl,
      twitterSite: row.twitterSite,
      robotsAllowIndex: row.robotsAllowIndex,
      keywords,
    },
    contact: {
      email: row.publicContactEmail,
      phone: row.publicPhone,
    },
    socialMedia: {
      facebook: row.facebookUrl,
      instagram: row.instagramUrl,
      youtube: row.youtubeUrl,
      x: row.xUrl,
    },
    footer: {
      description:
        locale === "ar" ? row.footerDescriptionAr : row.footerDescriptionEn,
    },
    faviconUrl: row.faviconUrl,
    googleAnalyticsMeasurementId: row.googleAnalyticsMeasurementId,
  }
}
