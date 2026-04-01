import { LOCALES } from "@/config"
import * as z from "zod/v4"

export const websiteContentLocaleSchema = z.enum(LOCALES)

export const websiteContentItemSchema = z.record(z.string(), z.unknown())

export const websiteContentUpsertSchema = z.object({
  locale: websiteContentLocaleSchema,
  content: websiteContentItemSchema,
})

export const websiteContentBilingualUpsertSchema = z.object({
  ar: websiteContentItemSchema,
  en: websiteContentItemSchema,
})

export type WebsiteContentUpsertInput = z.infer<typeof websiteContentUpsertSchema>
export type WebsiteContentBilingualUpsertInput = z.infer<
  typeof websiteContentBilingualUpsertSchema
>
