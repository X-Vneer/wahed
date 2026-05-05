import * as z from "zod/v4"

// Banner schema for creating banners
export const createBannerSchema = z
  .object({
    titleAr: z.string().min(1, { error: "banners.errors.titleAr.required" }),
    titleEn: z.string().min(1, { error: "banners.errors.titleEn.required" }),
    descriptionAr: z.string().optional().nullable(),
    descriptionEn: z.string().optional().nullable(),
    content: z.string().optional().nullable(),
    image: z.string().min(1, { error: "banners.errors.image.required" }),
    startDate: z.coerce.date({ error: "banners.errors.startDate.required" }),
    endDate: z.coerce.date({ error: "banners.errors.endDate.required" }),
    users: z.array(z.string()).optional().nullable(),
    isActive: z.boolean().optional().default(true),
  })
  .refine((data) => data.endDate > data.startDate, {
    path: ["endDate"],
    message: "banners.errors.endDate_before_startDate",
  })

export type CreateBannerInput = z.infer<typeof createBannerSchema>

// Update schema (all fields optional except validation)
export const updateBannerSchema = z
  .object({
    titleAr: z.string().min(1, { error: "banners.errors.titleAr.required" }).optional(),
    titleEn: z.string().min(1, { error: "banners.errors.titleEn.required" }).optional(),
    descriptionAr: z.string().optional().nullable(),
    descriptionEn: z.string().optional().nullable(),
    content: z.string().optional().nullable(),
    image: z.string().min(1, { error: "banners.errors.image.required" }).optional(),
    startDate: z.coerce.date({ error: "banners.errors.startDate.required" }).optional(),
    endDate: z.coerce.date({ error: "banners.errors.endDate.required" }).optional(),
    users: z.array(z.string()).optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Only validate if both dates are provided
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate
      }
      return true
    },
    {
      path: ["endDate"],
      message: "banners.errors.endDate_before_startDate",
    }
  )

export type UpdateBannerInput = z.infer<typeof updateBannerSchema>

