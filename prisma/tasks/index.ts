import { Prisma } from "@/lib/generated/prisma/client"

export const taskInclude = {
  status: true,
  category: true,
  subTasks: true,
  createdBy: true,
  assignedTo: true,
  taskAttachments: true,
  comments: true,
  project: true,
} satisfies Prisma.TaskInclude

export type Task = Prisma.TaskGetPayload<{
  include: typeof taskInclude
}>
