import * as z from "zod/v4"

export const createWebsiteSchema = z.object({
  nameAr: z.string().min(1, { error: "websites.errors.nameAr.required" }),
  nameEn: z.string().min(1, { error: "websites.errors.nameEn.required" }),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  url: z.string().url({ error: "websites.errors.url.invalid" }),
  image: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export type CreateWebsiteInput = z.infer<typeof createWebsiteSchema>

export const updateWebsiteSchema = z.object({
  nameAr: z
    .string()
    .min(1, { error: "websites.errors.nameAr.required" })
    .optional(),
  nameEn: z
    .string()
    .min(1, { error: "websites.errors.nameEn.required" })
    .optional(),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  url: z.string().url({ error: "websites.errors.url.invalid" }).optional(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export type UpdateWebsiteInput = z.infer<typeof updateWebsiteSchema>
