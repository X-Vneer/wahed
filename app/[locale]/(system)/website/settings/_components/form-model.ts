import {
  type WebsiteSiteSettingsFormValues,
} from "@/lib/schemas/website-site-settings"
import type { WebsiteSiteSettingsAdminDto } from "@/lib/website-site-settings/service"

export type FormModel = WebsiteSiteSettingsFormValues & { root?: string }

export function valuesFromSettings(
  s: WebsiteSiteSettingsAdminDto
): WebsiteSiteSettingsFormValues {
  return {
    primaryColor: s.primaryColor ?? "",
    accentColor: s.accentColor ?? "",
    blackColor: s.blackColor ?? "",
    secondaryTextColor: s.secondaryTextColor ?? "",
    fontAr: s.fontAr ?? "Inter",
    fontEn: s.fontEn ?? "Inter",

    logoForDarkBgUrl: s.logoForDarkBgUrl ?? "",
    logoForLightBgUrl: s.logoForLightBgUrl ?? "",
    siteNameAr: s.siteNameAr ?? "",
    siteNameEn: s.siteNameEn ?? "",
    defaultMetaTitleAr: s.defaultMetaTitleAr ?? "",
    defaultMetaTitleEn: s.defaultMetaTitleEn ?? "",
    defaultMetaDescriptionAr: s.defaultMetaDescriptionAr ?? "",
    defaultMetaDescriptionEn: s.defaultMetaDescriptionEn ?? "",
    ogImageUrl: s.ogImageUrl ?? "",
    siteUrl: s.siteUrl ?? "",
    twitterSite: s.twitterSite ?? "",
    robotsAllowIndex: s.robotsAllowIndex,
    keywordsAr: s.keywordsAr ?? "",
    keywordsEn: s.keywordsEn ?? "",
    publicContactEmail: s.publicContactEmail ?? "",
    publicPhone: s.publicPhone ?? "",
    faviconUrl: s.faviconUrl ?? "",
    googleAnalyticsMeasurementId: s.googleAnalyticsMeasurementId ?? "",
    facebookUrl: s.facebookUrl ?? "",
    instagramUrl: s.instagramUrl ?? "",
    youtubeUrl: s.youtubeUrl ?? "",
    xUrl: s.xUrl ?? "",
    footerDescriptionAr: s.footerDescriptionAr ?? "",
    footerDescriptionEn: s.footerDescriptionEn ?? "",
  }
}

export const emptyValues: WebsiteSiteSettingsFormValues = {
  primaryColor: "",
  accentColor: "",
  blackColor: "",
  secondaryTextColor: "",
  fontAr: "Inter",
  fontEn: "Inter",
  logoForDarkBgUrl: "",
  logoForLightBgUrl: "",
  siteNameAr: "",
  siteNameEn: "",
  defaultMetaTitleAr: "",
  defaultMetaTitleEn: "",
  defaultMetaDescriptionAr: "",
  defaultMetaDescriptionEn: "",
  ogImageUrl: "",
  siteUrl: "",
  twitterSite: "",
  robotsAllowIndex: true,
  keywordsAr: "",
  keywordsEn: "",
  publicContactEmail: "",
  publicPhone: "",
  faviconUrl: "",
  googleAnalyticsMeasurementId: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  xUrl: "",
  footerDescriptionAr: "",
  footerDescriptionEn: "",
}
