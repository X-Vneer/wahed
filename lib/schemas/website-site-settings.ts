import * as z from "zod/v4"

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color")

const urlOrEmpty = z.union([z.url(), z.literal("")])

const optionalHex = z.union([hexColor, z.literal("")])

/** Full website site settings (admin form + PATCH body). */
export const websiteSiteSettingsFormSchema = z.object({
  primaryColor: optionalHex,
  accentColor: optionalHex,
  blackColor: optionalHex,
  secondaryTextColor: optionalHex,

  fontAr: z.string().min(1).max(120),
  fontEn: z.string().min(1).max(120),

  logoForDarkBgUrl: urlOrEmpty,
  logoForLightBgUrl: urlOrEmpty,

  defaultMetaTitleAr: z.string().max(200),
  defaultMetaTitleEn: z.string().max(200),
  defaultMetaDescriptionAr: z.string().max(500),
  defaultMetaDescriptionEn: z.string().max(500),
  ogImageUrl: urlOrEmpty,
  siteUrl: urlOrEmpty,
  twitterSite: z.string().max(100),
  robotsAllowIndex: z.boolean(),
  keywordsAr: z.string().max(500),
  keywordsEn: z.string().max(500),

  publicContactEmail: z.union([z.email(), z.literal("")]),
  publicPhone: z.string().max(40),
  faviconUrl: urlOrEmpty,
  googleAnalyticsMeasurementId: z.string().max(32),
})

export type WebsiteSiteSettingsFormValues = z.infer<
  typeof websiteSiteSettingsFormSchema
>

export const updateWebsiteSiteSettingsSchema = websiteSiteSettingsFormSchema

export type UpdateWebsiteSiteSettingsInput = WebsiteSiteSettingsFormValues
