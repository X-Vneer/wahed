import db from "@/lib/db"
import {
  type Prisma,
  type SystemSiteSettings,
} from "@/lib/generated/prisma/client"
import { emptyToNull } from "@/utils"
import type { UpdateSystemSiteSettingsInput } from "@/schemas/system-site-settings"

const DEFAULT_CREATE: Prisma.SystemSiteSettingsCreateInput = {
  systemNameAr: "وهد",
  systemNameEn: "Wahd",
  sidebarVariant: "light",
  defaultLocale: "en",
}

export type SystemSiteSettingsAdminDto = {
  systemNameAr: string | null
  systemNameEn: string | null

  logoForDarkBgUrl: string | null
  logoForLightBgUrl: string | null
  logoSquareUrl: string | null
  faviconUrl: string | null

  primaryColor: string | null
  accentColor: string | null

  sidebarVariant: string | null
  defaultLocale: string | null

  loginBackgroundUrl: string | null
  loginWelcomeTitleAr: string | null
  loginWelcomeTitleEn: string | null
  loginSubtitleAr: string | null
  loginSubtitleEn: string | null

  supportEmail: string | null
  supportPhone: string | null
}

function rowToAdminDto(row: SystemSiteSettings): SystemSiteSettingsAdminDto {
  return {
    systemNameAr: row.systemNameAr,
    systemNameEn: row.systemNameEn,
    logoForDarkBgUrl: row.logoForDarkBgUrl,
    logoForLightBgUrl: row.logoForLightBgUrl,
    logoSquareUrl: row.logoSquareUrl,
    faviconUrl: row.faviconUrl,
    primaryColor: row.primaryColor,
    accentColor: row.accentColor,
    sidebarVariant: row.sidebarVariant,
    defaultLocale: row.defaultLocale,
    loginBackgroundUrl: row.loginBackgroundUrl,
    loginWelcomeTitleAr: row.loginWelcomeTitleAr,
    loginWelcomeTitleEn: row.loginWelcomeTitleEn,
    loginSubtitleAr: row.loginSubtitleAr,
    loginSubtitleEn: row.loginSubtitleEn,
    supportEmail: row.supportEmail,
    supportPhone: row.supportPhone,
  }
}

export async function getOrCreateSystemSiteSettings(): Promise<SystemSiteSettings> {
  const existing = await db.systemSiteSettings.findFirst({
    orderBy: { createdAt: "asc" },
  })
  if (existing) return existing

  return db.systemSiteSettings.create({
    data: { ...DEFAULT_CREATE },
  })
}

export async function getSystemSiteSettingsAdmin(): Promise<SystemSiteSettingsAdminDto> {
  const row = await getOrCreateSystemSiteSettings()
  return rowToAdminDto(row)
}

export async function patchSystemSiteSettings(
  input: UpdateSystemSiteSettingsInput
): Promise<SystemSiteSettingsAdminDto> {
  const current = await getOrCreateSystemSiteSettings()

  const data: Prisma.SystemSiteSettingsUpdateInput = {
    systemNameAr: emptyToNull(input.systemNameAr),
    systemNameEn: emptyToNull(input.systemNameEn),
    logoForDarkBgUrl: emptyToNull(input.logoForDarkBgUrl),
    logoForLightBgUrl: emptyToNull(input.logoForLightBgUrl),
    logoSquareUrl: emptyToNull(input.logoSquareUrl),
    faviconUrl: emptyToNull(input.faviconUrl),
    primaryColor: emptyToNull(input.primaryColor),
    accentColor: emptyToNull(input.accentColor),
    sidebarVariant: input.sidebarVariant,
    defaultLocale: input.defaultLocale,
    loginBackgroundUrl: emptyToNull(input.loginBackgroundUrl),
    loginWelcomeTitleAr: emptyToNull(input.loginWelcomeTitleAr),
    loginWelcomeTitleEn: emptyToNull(input.loginWelcomeTitleEn),
    loginSubtitleAr: emptyToNull(input.loginSubtitleAr),
    loginSubtitleEn: emptyToNull(input.loginSubtitleEn),
    supportEmail: emptyToNull(input.supportEmail),
    supportPhone: emptyToNull(input.supportPhone),
  }

  const updated = await db.systemSiteSettings.update({
    where: { id: current.id },
    data,
  })

  return rowToAdminDto(updated)
}

/**
 * Lightweight branding DTO used by the root layout to render logos/colors/title.
 * Safe to call on every request since the row is tiny and cached per-request.
 */
export type SystemBranding = {
  systemName: string
  systemNameAr: string | null
  systemNameEn: string | null
  logoForDarkBgUrl: string | null
  logoForLightBgUrl: string | null
  logoSquareUrl: string | null
  faviconUrl: string | null
  primaryColor: string | null
  accentColor: string | null
  sidebarVariant: "light" | "dark"
  loginBackgroundUrl: string | null
  loginWelcomeTitle: string | null
  loginSubtitle: string | null
  supportEmail: string | null
  supportPhone: string | null
}

export async function getSystemBranding(
  locale: "ar" | "en"
): Promise<SystemBranding> {
  const row = await getOrCreateSystemSiteSettings()
  const nameLocalized =
    (locale === "ar" ? row.systemNameAr : row.systemNameEn) ??
    row.systemNameEn ??
    row.systemNameAr ??
    "Wahd"

  const sidebarVariant = row.sidebarVariant === "dark" ? "dark" : "light"

  return {
    systemName: nameLocalized,
    systemNameAr: row.systemNameAr,
    systemNameEn: row.systemNameEn,
    logoForDarkBgUrl: row.logoForDarkBgUrl,
    logoForLightBgUrl: row.logoForLightBgUrl,
    logoSquareUrl: row.logoSquareUrl,
    faviconUrl: row.faviconUrl,
    primaryColor: row.primaryColor,
    accentColor: row.accentColor,
    sidebarVariant,
    loginBackgroundUrl: row.loginBackgroundUrl,
    loginWelcomeTitle:
      locale === "ar" ? row.loginWelcomeTitleAr : row.loginWelcomeTitleEn,
    loginSubtitle: locale === "ar" ? row.loginSubtitleAr : row.loginSubtitleEn,
    supportEmail: row.supportEmail,
    supportPhone: row.supportPhone,
  }
}
