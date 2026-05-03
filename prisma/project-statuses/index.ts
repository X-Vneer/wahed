import type { ProjectStatus as PrismaProjectStatus } from "@/lib/generated/prisma/client"

export const transformProjectStatus = (
  projectStatus: PrismaProjectStatus,
  locale: string
) => {
  const name = locale === "ar" ? projectStatus.nameAr : projectStatus.nameEn
  return {
    ...projectStatus,
    name,
  }
}

export type ProjectStatus = ReturnType<typeof transformProjectStatus>
