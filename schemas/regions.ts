import * as z from "zod/v4"

// Region form schema - matches the frontend form validation
// Error messages are translation keys that should be translated when displaying errors
export const baseRegionSchema = z.object({
  nameAr: z.string().min(1, { error: "regions.errors.nameAr.required" }),
  nameEn: z.string().min(1, { error: "regions.errors.nameEn.required" }),
})

export const createRegionSchema = baseRegionSchema
export const updateRegionSchema = baseRegionSchema

export type CreateRegionInput = z.infer<typeof createRegionSchema>
export type UpdateRegionInput = z.infer<typeof updateRegionSchema>
