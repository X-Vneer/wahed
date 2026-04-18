import * as z from "zod/v4"

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color")

const urlOrEmpty = z.union([z.url(), z.literal("")])
const optionalHex = z.union([hexColor, z.literal("")])

export const SYSTEM_SIDEBAR_VARIANTS = ["light", "dark"] as const
export const SYSTEM_DEFAULT_LOCALES = ["ar", "en"] as const

/** Full system site settings (admin form + PATCH body). */
export const systemSiteSettingsFormSchema = z.object({
  systemNameAr: z.string().max(120),
  systemNameEn: z.string().max(120),

  logoForDarkBgUrl: urlOrEmpty,
  logoForLightBgUrl: urlOrEmpty,
  logoSquareUrl: urlOrEmpty,
  faviconUrl: urlOrEmpty,

  primaryColor: optionalHex,
  accentColor: optionalHex,

  sidebarVariant: z.enum(SYSTEM_SIDEBAR_VARIANTS),
  defaultLocale: z.enum(SYSTEM_DEFAULT_LOCALES),

  loginBackgroundUrl: urlOrEmpty,
  loginWelcomeTitleAr: z.string().max(200),
  loginWelcomeTitleEn: z.string().max(200),
  loginSubtitleAr: z.string().max(300),
  loginSubtitleEn: z.string().max(300),

  supportEmail: z.union([z.email(), z.literal("")]),
  supportPhone: z.string().max(40),
})

export type SystemSiteSettingsFormValues = z.infer<
  typeof systemSiteSettingsFormSchema
>

export const updateSystemSiteSettingsSchema = systemSiteSettingsFormSchema

export type UpdateSystemSiteSettingsInput = SystemSiteSettingsFormValues
