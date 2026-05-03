import type { PublicProjectStatus as PrismaPublicProjectStatus } from "@/lib/generated/prisma/client"

export const transformPublicProjectStatus = (
  publicProjectStatus: PrismaPublicProjectStatus,
  locale: string
) => {
  const name =
    locale === "ar"
      ? publicProjectStatus.nameAr
      : publicProjectStatus.nameEn
  return {
    ...publicProjectStatus,
    name,
  }
}

export type PublicProjectStatus = ReturnType<typeof transformPublicProjectStatus>
