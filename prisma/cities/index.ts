import type {
  City as PrismaCity,
  Region as PrismaRegion,
} from "@/lib/generated/prisma/client"

export const transformCity = (
  city: PrismaCity & { region?: PrismaRegion | null },
  locale: string
) => {
  const name = locale === "ar" ? city.nameAr : city.nameEn
  const regionName =
    city.region && (locale === "ar" ? city.region.nameAr : city.region.nameEn)

  return {
    ...city,
    name,
    regionName: regionName ?? null,
  }
}

export type City = ReturnType<typeof transformCity>
