import * as z from "zod/v4"

// TaskStatus form schema - matches the frontend form validation
// Error messages are translation keys that should be translated when displaying errors
export const baseTaskStatusSchema = z.object({
  nameAr: z.string().min(1, { error: "taskStatus.errors.nameAr.required" }),
  nameEn: z.string().min(1, { error: "taskStatus.errors.nameEn.required" }),
  color: z.string().min(1, { error: "taskStatus.errors.color.required" }),
})

export const createTaskStatusSchema = baseTaskStatusSchema
export const updateTaskStatusSchema = baseTaskStatusSchema

export type CreateTaskStatusInput = z.infer<typeof createTaskStatusSchema>
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>
