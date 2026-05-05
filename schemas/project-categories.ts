import * as z from "zod/v4"

// ProjectCategory form schema - matches the frontend form validation
// Error messages are translation keys that should be translated when displaying errors
export const createProjectCategorySchema = z.object({
  nameAr: z
    .string()
    .min(1, { error: "projectCategories.errors.nameAr.required" }),
  nameEn: z
    .string()
    .min(1, { error: "projectCategories.errors.nameEn.required" }),
  isActive: z.boolean().default(true),
})

export const updateProjectCategorySchema = createProjectCategorySchema
export type CreateProjectCategoryInput = z.infer<
  typeof createProjectCategorySchema
>
export type UpdateProjectCategoryInput = z.infer<
  typeof updateProjectCategorySchema
>
