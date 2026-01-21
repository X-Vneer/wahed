import type { Website } from "@/lib/generated/prisma/client"

export const transformWebsite = (website: Website, locale: string) => {
  return {
    ...website,
    name: locale === "ar" ? website.nameAr : website.nameEn,
  }
}
