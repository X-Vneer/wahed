import * as z from "zod/v4"

const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"])

const createSubTaskSchema = z.object({
  title: z.string().min(1, { message: "tasks.errors.subtask_title_required" }),
  description: z.string().optional(),
})

export const createTaskSchema = z.object({
  title: z.string().min(1, { message: "tasks.errors.title_required" }),
  description: z.string().optional(),
  projectId: z.string().min(1, { message: "tasks.errors.project_required" }),
  statusId: z.string().min(1, { message: "tasks.errors.status_required" }),
  categoryIds: z.array(z.string().min(1)).optional().default([]),
  estimatedWorkingDays: z.number().int().nonnegative().optional(),
  priority: TaskPriorityEnum.optional().default("MEDIUM"),
  assignedToIds: z.array(z.string().min(1)).optional().default([]),
  subTasks: z.array(createSubTaskSchema).optional().default([]),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
