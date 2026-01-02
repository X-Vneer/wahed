"use server"
import type { ProjectCategory as PrismaProjectCategory } from "@/lib/generated/prisma/client"

export const transformProjectCategory = (
  projectCategory: PrismaProjectCategory,
  locale: string
) => {
  const name = locale === "ar" ? projectCategory.nameAr : projectCategory.nameEn
  return {
    id: projectCategory.id,
    name,
    isActive: projectCategory.isActive,
    createdAt: projectCategory.createdAt,
    updatedAt: projectCategory.updatedAt,
  }
}

export type ProjectCategory = ReturnType<typeof transformProjectCategory>
