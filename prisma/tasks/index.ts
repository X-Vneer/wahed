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

export type TaskInclude = Prisma.TaskGetPayload<{
  include: typeof taskInclude
}>

export const transformTask = (task: TaskInclude, locale: string) => {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    estimatedWorkingDays: task.estimatedWorkingDays,
    startedAt: task.startedAt,
    doneAt: task.doneAt,
    priority: task.priority,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    createdBy: task.createdBy,
    comments: task.comments,
    taskAttachments: task.taskAttachments,
    subTasks: task.subTasks,
    category: task.category.map((category) => ({
      name: locale === "ar" ? category.nameAr : category.nameEn,
      id: category.id,
    })),
    status: {
      name: locale === "ar" ? task.status.nameAr : task.status.nameEn,
      color: task.status.color,
    },
    project: {
      name: locale === "ar" ? task.project.nameAr : task.project.nameEn,
      description:
        locale === "ar"
          ? task.project.descriptionAr
          : task.project.descriptionEn,
    },
    assignedTo: task.assignedTo,
  }
}

export type Task = ReturnType<typeof transformTask>
