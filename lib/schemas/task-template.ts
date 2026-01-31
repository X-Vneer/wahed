import * as z from "zod/v4"

const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"])

const taskTemplateSubItemSchema = z.object({
  title: z
    .string()
    .min(1, { message: "taskTemplate.errors.subItemTitle.required" }),
  description: z.string().optional(),
  order: z.number().int().min(0).default(0),
})

export const createTaskTemplateSchema = z.object({
  title: z.string().min(1, { message: "taskTemplate.errors.title.required" }),
  description: z.string().optional(),
  estimatedWorkingDays: z.number().int().min(0).optional(),
  priority: taskPriorityEnum.default("MEDIUM"),
  defaultStatusId: z.cuid().optional().nullable(),
  categoryIds: z.array(z.cuid()).default([]),
  subItems: z.array(taskTemplateSubItemSchema).default([]),
  isActive: z.boolean().default(true),
})

export const updateTaskTemplateSchema = createTaskTemplateSchema.partial()

export type CreateTaskTemplateInput = z.infer<typeof createTaskTemplateSchema>
export type UpdateTaskTemplateInput = z.infer<typeof updateTaskTemplateSchema>
export type TaskTemplateSubItemInput = z.infer<typeof taskTemplateSubItemSchema>
