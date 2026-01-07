import * as z from "zod/v4"

// TaskCategory form schema - matches the frontend form validation
// Error messages are translation keys that should be translated when displaying errors
export const createTaskCategorySchema = z.object({
  nameAr: z.string().min(1, { error: "taskCategory.errors.nameAr.required" }),
  nameEn: z.string().min(1, { error: "taskCategory.errors.nameEn.required" }),
  isActive: z.boolean().default(true),
})

export const updateTaskCategorySchema = createTaskCategorySchema
export type CreateTaskCategoryInput = z.infer<typeof createTaskCategorySchema>
export type UpdateTaskCategoryInput = z.infer<typeof updateTaskCategorySchema>
