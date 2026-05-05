import * as z from "zod/v4"

const urlOrEmpty = z.union([z.url(), z.literal("")])

export const websitePageSeoSchema = z.object({
  metaTitleAr: z
    .string()
    .trim()
    .max(200, { message: "websiteCms.pageSeo.errors.metaTitleMax" }),
  metaTitleEn: z
    .string()
    .trim()
    .max(200, { message: "websiteCms.pageSeo.errors.metaTitleMax" }),
  metaDescriptionAr: z
    .string()
    .trim()
    .max(500, { message: "websiteCms.pageSeo.errors.metaDescriptionMax" }),
  metaDescriptionEn: z
    .string()
    .trim()
    .max(500, { message: "websiteCms.pageSeo.errors.metaDescriptionMax" }),
  canonicalUrl: urlOrEmpty,
  ogImageUrl: urlOrEmpty,
  twitterHandle: z
    .string()
    .trim()
    .max(100, { message: "websiteCms.pageSeo.errors.twitterHandleMax" }),
  keywordsAr: z
    .string()
    .trim()
    .max(500, { message: "websiteCms.pageSeo.errors.keywordsMax" }),
  keywordsEn: z
    .string()
    .trim()
    .max(500, { message: "websiteCms.pageSeo.errors.keywordsMax" }),
  robotsAllowIndex: z.boolean(),
})

export type WebsitePageSeoValues = z.infer<typeof websitePageSeoSchema>
