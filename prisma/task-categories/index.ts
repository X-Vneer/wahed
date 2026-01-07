import type { TaskCategory as PrismaTaskCategory } from "@/lib/generated/prisma/client"

export const transformTaskCategory = (
  taskCategory: PrismaTaskCategory,
  locale: string
) => {
  const name = locale === "ar" ? taskCategory.nameAr : taskCategory.nameEn
  return {
    ...taskCategory,
    name,
  }
}

export type TaskCategory = ReturnType<typeof transformTaskCategory>
