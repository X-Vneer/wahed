import { Prisma } from "@/lib/generated/prisma/client"

export const bannerInclude = {
  users: {
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
    },
  },
} satisfies Prisma.BannerInclude

export type BannerInclude = Prisma.BannerGetPayload<{
  include: typeof bannerInclude
}>

export const transformBanner = (banner: BannerInclude, locale: string) => {
  const title = locale === "ar" ? banner.titleAr : banner.titleEn
  const description =
    locale === "ar" ? banner.descriptionAr : banner.descriptionEn
  return {
    id: banner.id,
    title: title,
    titleAr: banner.titleAr,
    titleEn: banner.titleEn,
    description: description,
    descriptionAr: banner.descriptionAr,
    descriptionEn: banner.descriptionEn,
    image: banner.image,
    startDate: banner.startDate,
    endDate: banner.endDate,
    users: banner.users.map((user) => ({
      id: user.id,
      name: user.name,
      image: user.image,
      email: user.email,
    })),
    content: banner.content,
    isActive: banner.isActive,
    createdAt: banner.createdAt,
    updatedAt: banner.updatedAt,
  }
}

export type TransformedBanner = ReturnType<typeof transformBanner>
