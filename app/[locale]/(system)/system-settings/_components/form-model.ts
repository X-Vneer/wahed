import type { SystemSiteSettingsFormValues } from "@/lib/schemas/system-site-settings"
import type { SystemSiteSettingsAdminDto } from "@/lib/system-site-settings/service"

export type FormModel = SystemSiteSettingsFormValues & { root?: string }

function toVariant(
  value: string | null | undefined
): SystemSiteSettingsFormValues["sidebarVariant"] {
  return value === "dark" ? "dark" : "light"
}

function toLocale(
  value: string | null | undefined
): SystemSiteSettingsFormValues["defaultLocale"] {
  return value === "ar" ? "ar" : "en"
}

export function valuesFromSettings(
  s: SystemSiteSettingsAdminDto
): SystemSiteSettingsFormValues {
  return {
    systemNameAr: s.systemNameAr ?? "",
    systemNameEn: s.systemNameEn ?? "",
    logoForDarkBgUrl: s.logoForDarkBgUrl ?? "",
    logoForLightBgUrl: s.logoForLightBgUrl ?? "",
    logoSquareUrl: s.logoSquareUrl ?? "",
    faviconUrl: s.faviconUrl ?? "",
    primaryColor: s.primaryColor ?? "",
    accentColor: s.accentColor ?? "",
    sidebarVariant: toVariant(s.sidebarVariant),
    defaultLocale: toLocale(s.defaultLocale),
    loginBackgroundUrl: s.loginBackgroundUrl ?? "",
    loginWelcomeTitleAr: s.loginWelcomeTitleAr ?? "",
    loginWelcomeTitleEn: s.loginWelcomeTitleEn ?? "",
    loginSubtitleAr: s.loginSubtitleAr ?? "",
    loginSubtitleEn: s.loginSubtitleEn ?? "",
    supportEmail: s.supportEmail ?? "",
    supportPhone: s.supportPhone ?? "",
  }
}

export const emptyValues: SystemSiteSettingsFormValues = {
  systemNameAr: "",
  systemNameEn: "",
  logoForDarkBgUrl: "",
  logoForLightBgUrl: "",
  logoSquareUrl: "",
  faviconUrl: "",
  primaryColor: "",
  accentColor: "",
  sidebarVariant: "light",
  defaultLocale: "en",
  loginBackgroundUrl: "",
  loginWelcomeTitleAr: "",
  loginWelcomeTitleEn: "",
  loginSubtitleAr: "",
  loginSubtitleEn: "",
  supportEmail: "",
  supportPhone: "",
}
