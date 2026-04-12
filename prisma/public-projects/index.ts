import { Prisma } from "@/lib/generated/prisma/client"

export const publicProjectInclude = {
  badge: true,
  features: true,
  categories: true,
} satisfies Prisma.PublicProjectInclude

export type PublicProjectInclude = Prisma.PublicProjectGetPayload<{
  include: typeof publicProjectInclude
}>

function localized(
  ar: string | null,
  en: string | null,
  locale: string
): string | null {
  return locale === "ar" ? (ar || en) : (en || ar)
}

export const transformPublicProject = (
  project: PublicProjectInclude,
  locale: string
) => {
  return {
    id: project.id,
    slug: project.slug,
    title: localized(project.titleAr, project.titleEn, locale) ?? "",
    description: localized(project.descriptionAr, project.descriptionEn, locale),
    shortDescription: localized(
      project.shortDescriptionAr,
      project.shortDescriptionEn,
      locale
    ),
    images: project.images,
    isActive: project.isActive,
    status: project.status,
    location: localized(project.locationAr, project.locationEn, locale),
    area: project.area,
    googleMapsAddress: project.googleMapsAddress,
    startingPrice: project.startingPrice,
    endingPrice: project.endingPrice,
    category: project.categories[0]
      ? localized(
          project.categories[0].nameAr,
          project.categories[0].nameEn,
          locale
        )
      : null,
    badges: project.badge.map((b) => ({
      id: b.id,
      name: localized(b.nameAr, b.nameEn, locale) ?? "",
      color: b.color,
    })),
    features: project.features.map((f) => ({
      id: f.id,
      label: localized(f.labelAr, f.labelEn, locale) ?? "",
      value: localized(f.valueAr, f.valueEn, locale),
      icon: f.icon,
    })),
    createdAt: project.createdAt,
  }
}

export type TransformedPublicProject = ReturnType<typeof transformPublicProject>
