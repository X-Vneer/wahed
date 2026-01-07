import type { TaskStatus as PrismaTaskStatus } from "@/lib/generated/prisma/client"

export const transformTaskStatus = (
  taskStatus: PrismaTaskStatus,
  locale: string
) => {
  const name = locale === "ar" ? taskStatus.nameAr : taskStatus.nameEn
  return {
    ...taskStatus,
    name,
  }
}

export type TaskStatus = ReturnType<typeof transformTaskStatus>
