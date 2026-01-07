import * as z from "zod/v4"

// City form schema - matches the frontend form validation
// Error messages are translation keys that should be translated when displaying errors
export const baseCitySchema = z.object({
  nameAr: z.string().min(1, { error: "cities.errors.nameAr.required" }),
  nameEn: z.string().min(1, { error: "cities.errors.nameEn.required" }),
  regionId: z.string().min(1, { error: "cities.errors.regionId.required" }),
})

export const createCitySchema = baseCitySchema
export const updateCitySchema = baseCitySchema

export type CreateCityInput = z.infer<typeof createCitySchema>
export type UpdateCityInput = z.infer<typeof updateCitySchema>
