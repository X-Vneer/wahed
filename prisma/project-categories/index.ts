import type { ProjectCategory as PrismaProjectCategory } from "@/lib/generated/prisma/client"

export const transformProjectCategory = (
  projectCategory: PrismaProjectCategory,
  locale: string
) => {
  const name = locale === "ar" ? projectCategory.nameAr : projectCategory.nameEn
  return {
    ...projectCategory,
    name,
  }
}

export type ProjectCategory = ReturnType<typeof transformProjectCategory>
