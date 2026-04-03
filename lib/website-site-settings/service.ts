import db from "@/lib/db"
import {
  type Prisma,
  type WebsiteSiteSettings,
} from "@/lib/generated/prisma/client"
import type { UpdateWebsiteSiteSettingsInput } from "@/lib/schemas/website-site-settings"

const DEFAULT_CREATE = {
  primaryColor: "#0f172a" as string | null,
  accentColor: "#2563eb" as string | null,
  fontAr: "Inter",
  fontEn: "Inter",
  defaultMetaTitleAr: "لوحة تحكم النظام الداخلي",
  defaultMetaTitleEn: "Internal System Dashboard",
} as const satisfies Prisma.WebsiteSiteSettingsCreateInput

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
}

function rowToAdminDto(row: WebsiteSiteSettings): WebsiteSiteSettingsAdminDto {
  return {
    primaryColor: row.primaryColor,
    accentColor: row.accentColor,
    blackColor: row.blackColor,
    secondaryTextColor: row.SecondaryTextColor,
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
    SecondaryTextColor: emptyToNull(input.secondaryTextColor),
    fontAr: input.fontAr,
    fontEn: input.fontEn,
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
  const fontFamily = locale === "ar" ? row.fontAr : row.fontEn

  return {
    locale,
    theme: {
      primaryColor: row.primaryColor,
      accentColor: row.accentColor,
      blackColor: row.blackColor,
      secondaryTextColor: row.SecondaryTextColor,
    },
    fonts: {
      fontAr: row.fontAr,
      fontEn: row.fontEn,
      /** Resolved font for the requested locale */
      family: fontFamily,
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
    faviconUrl: row.faviconUrl,
    googleAnalyticsMeasurementId: row.googleAnalyticsMeasurementId,
  }
}
