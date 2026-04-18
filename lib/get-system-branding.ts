import { getSystemBranding, type SystemBranding } from "@/lib/system-site-settings/service"

const FALLBACK: SystemBranding = {
  systemName: "Wahd",
  systemNameAr: null,
  systemNameEn: "Wahd",
  logoForDarkBgUrl: null,
  logoForLightBgUrl: null,
  logoSquareUrl: null,
  faviconUrl: null,
  primaryColor: null,
  accentColor: null,
  sidebarVariant: "light",
  loginBackgroundUrl: null,
  loginWelcomeTitle: null,
  loginSubtitle: null,
  supportEmail: null,
  supportPhone: null,
}

/** Server-side branding fetch with a safe fallback so layouts never fail to render. */
export async function getSystemBrandingSafe(
  locale: "ar" | "en"
): Promise<SystemBranding> {
  try {
    return await getSystemBranding(locale)
  } catch (error) {
    console.error("Failed to fetch system branding:", error)
    return FALLBACK
  }
}
