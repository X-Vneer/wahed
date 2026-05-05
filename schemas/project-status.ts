import * as z from "zod/v4"

export const baseProjectStatusSchema = z.object({
  nameAr: z.string().min(1, { error: "projectStatus.errors.nameAr.required" }),
  nameEn: z.string().min(1, { error: "projectStatus.errors.nameEn.required" }),
  color: z.string().min(1, { error: "projectStatus.errors.color.required" }),
})

export const createProjectStatusSchema = baseProjectStatusSchema
export const updateProjectStatusSchema = baseProjectStatusSchema

export type CreateProjectStatusInput = z.infer<
  typeof createProjectStatusSchema
>
export type UpdateProjectStatusInput = z.infer<
  typeof updateProjectStatusSchema
>
