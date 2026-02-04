import { Prisma } from "@/lib/generated/prisma/client"

export const projectInclude = {
  additionalData: true,
  attachments: true,
  categories: true,
  city: {
    include: {
      region: true,
    },
  },
  tasks: {
    select: {
      id: true,
      title: true,
      description: true,
      status: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          color: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      doneAt: true,
      startedAt: true,
      estimatedWorkingDays: true,
      createdBy: true,
    },
  },
} satisfies Prisma.ProjectInclude

export type ProjectInclude = Prisma.ProjectGetPayload<{
  include: typeof projectInclude
}>

export const transformProject = (project: ProjectInclude, locale: string) => {
  const tasks = project.tasks
  const doneTaskCount = tasks.filter((t) => t.doneAt != null).length
  const remainingDays = tasks
    .filter((t) => t.doneAt == null)
    .reduce((sum, t) => sum + (t.estimatedWorkingDays ?? 0), 0)

  return {
    id: project.id,
    taskCount: tasks.length,
    doneTaskCount,
    remainingDays,
    tasks: tasks.map((task) => {
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: {
          id: task.status.id,
          name: locale === "ar" ? task.status.nameAr : task.status.nameEn,
          color: task.status.color,
        },
        categories: task.category.map((category) => ({
          id: category.id,
          name: locale === "ar" ? category.nameAr : category.nameEn,
        })),
        assignedTo: task.assignedTo,
        doneAt: task.doneAt,
        startedAt: task.startedAt,
        estimatedWorkingDays: task.estimatedWorkingDays,
        createdBy: task.createdBy,
      }
    }),
    area: project.area ? project.area.toFixed(2) : null,
    numberOfFloors: project.numberOfFloors ? project.numberOfFloors : null,
    deedNumber: project.deedNumber ? project.deedNumber : null,
    workDuration: project.workDuration ? project.workDuration : null,
    googleMapsAddress: project.googleMapsAddress
      ? project.googleMapsAddress
      : null,
    status: project.status,
    isActive: project.isActive ? project.isActive : null,
    archivedAt: project.archivedAt ? project.archivedAt : null,
    createdAt: project.createdAt ? project.createdAt : null,
    updatedAt: project.updatedAt ? project.updatedAt : null,
    cityId: project.cityId ? project.cityId : null,
    image: project.image ? project.image : null,
    name: locale === "ar" ? project.nameAr : project.nameEn,
    description:
      locale === "ar" ? project.descriptionAr : project.descriptionEn,
    cityName: locale === "ar" ? project.city.nameAr : project.city.nameEn,
    regionName:
      locale === "ar" ? project.city.region.nameAr : project.city.region.nameEn,
    categories: project.categories.map((category) =>
      locale === "ar" ? category.nameAr : category.nameEn
    ),
    attachments: project.attachments,
    additionalData: project.additionalData,
  }
}
export type TransformedProject = ReturnType<typeof transformProject>
