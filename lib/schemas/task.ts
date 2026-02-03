import * as z from "zod/v4"

const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"])

export const createSubTaskSchema = z.object({
  title: z.string().min(1, { message: "tasks.errors.subtask_title_required" }),
  description: z.string().optional(),
})

export type CreateSubTaskInput = z.infer<typeof createSubTaskSchema>

export const updateSubTaskSchema = z.object({
  title: z
    .string()
    .min(1, { message: "tasks.errors.subtask_title_required" })
    .optional(),
  description: z.string().optional().nullable(),
})

export type UpdateSubTaskInput = z.infer<typeof updateSubTaskSchema>

export const createTaskSchema = z.object({
  title: z.string().min(1, { message: "tasks.errors.title_required" }),
  description: z.string().optional(),
  projectId: z.string().min(1, { message: "tasks.errors.project_required" }),
  statusId: z.string().min(1, { message: "tasks.errors.status_required" }),
  categoryIds: z.array(z.string().min(1)).optional().default([]),
  estimatedWorkingDays: z.coerce.number().int().nonnegative().optional(),
  priority: TaskPriorityEnum.optional().default("MEDIUM"),
  assignedToIds: z.array(z.string().min(1)).optional().default([]),
  subTasks: z.array(createSubTaskSchema).optional().default([]),
  saveAsTemplate: z.boolean().optional().default(false),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, { message: "tasks.errors.title_required" })
    .optional(),
  description: z.string().optional().nullable(),
  statusId: z
    .string()
    .min(1, { message: "tasks.errors.status_required" })
    .optional(),
  categoryIds: z.array(z.string().min(1)).optional(),
  estimatedWorkingDays: z.number().int().nonnegative().optional().nullable(),
  priority: TaskPriorityEnum.optional(),
  assignedToIds: z.array(z.string().min(1)).optional(),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export const changeTaskStatusSchema = z.object({
  statusId: z.string().min(1, { message: "tasks.errors.status_required" }),
})

export type ChangeTaskStatusInput = z.infer<typeof changeTaskStatusSchema>

export const importTasksFromTemplatesSchema = z.object({
  projectId: z.string().min(1, { message: "tasks.errors.project_required" }),
  templateIds: z
    .array(z.string().min(1))
    .min(1, { message: "tasks.errors.templates_required" }),
  statusId: z
    .string()
    .min(1, { message: "tasks.errors.status_required" })
    .optional(),
})

export type ImportTasksFromTemplatesInput = z.infer<
  typeof importTasksFromTemplatesSchema
>
