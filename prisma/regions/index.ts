import type { Region as PrismaRegion } from "@/lib/generated/prisma/client"

export const transformRegion = (
  region: PrismaRegion & { _count?: { cities: number } },
  locale: string
) => {
  const name = locale === "ar" ? region.nameAr : region.nameEn
  return {
    ...region,
    name,
    citiesCount: region._count?.cities ?? 0,
  }
}

export type Region = ReturnType<typeof transformRegion>
