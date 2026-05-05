import * as z from "zod/v4"

export const basePublicProjectStatusSchema = z.object({
  nameAr: z
    .string()
    .min(1, { error: "publicProjectStatus.errors.nameAr.required" }),
  nameEn: z
    .string()
    .min(1, { error: "publicProjectStatus.errors.nameEn.required" }),
  color: z
    .string()
    .min(1, { error: "publicProjectStatus.errors.color.required" }),
})

export const createPublicProjectStatusSchema = basePublicProjectStatusSchema
export const updatePublicProjectStatusSchema = basePublicProjectStatusSchema

export type CreatePublicProjectStatusInput = z.infer<
  typeof createPublicProjectStatusSchema
>
export type UpdatePublicProjectStatusInput = z.infer<
  typeof updatePublicProjectStatusSchema
>
