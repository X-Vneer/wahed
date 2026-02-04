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

/** Include for task detail page: comments with createdBy */
export const taskDetailInclude = {
  ...taskInclude,
  comments: {
    include: {
      createdBy: { select: { id: true, name: true, image: true } },
    },
  },
} satisfies Prisma.TaskInclude

export type TaskDetailInclude = Prisma.TaskGetPayload<{
  include: typeof taskDetailInclude
}>

export const transformTask = (task: TaskInclude, locale: string) => {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    estimatedWorkingDays: task.estimatedWorkingDays,
    startedAt: task.startedAt,
    doneAt: task.doneAt,
    order: task.order,
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
      id: task.status.id,
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

export function transformTaskDetail(task: TaskDetailInclude, locale: string) {
  const base = transformTask(task as unknown as TaskInclude, locale)
  return {
    ...base,
    comments: task.comments.map((c) => ({
      id: c.id,
      content: c.content,
      taskId: c.taskId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      createdBy: c.createdBy,
    })),
  }
}

export type TaskDetail = ReturnType<typeof transformTaskDetail>
