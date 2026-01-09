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
} satisfies Prisma.ProjectInclude

export type ProjectInclude = Prisma.ProjectGetPayload<{
  include: typeof projectInclude
}>

export const transformProject = (project: ProjectInclude, locale: string) => {
  console.log("🚀 ~ transformProject ~ locale:", locale)
  return {
    id: project.id,
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
