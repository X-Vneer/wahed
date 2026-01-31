import type { Prisma } from "@/lib/generated/prisma/client"

export const tasksTemplateInclude = {
  defaultStatus: true,
  categories: true,
  subItems: { orderBy: { order: "asc" } },
} satisfies Prisma.TaskTemplateInclude

export type TaskTemplate = Prisma.TaskTemplateGetPayload<{
  include: typeof tasksTemplateInclude
}>
