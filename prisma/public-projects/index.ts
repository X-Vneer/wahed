import { Prisma } from "@/lib/generated/prisma/client"

export const publicProjectInclude = {
  badge: true,
  features: true,
  categories: true,
  attachments: true,
  city: {
    include: {
      region: true,
    },
  },
} satisfies Prisma.PublicProjectInclude

export type PublicProjectInclude = Prisma.PublicProjectGetPayload<{
  include: typeof publicProjectInclude
}>

function localized(
  ar: string | null,
  en: string | null,
  locale: string
): string | null {
  return locale === "ar" ? ar || en : en || ar
}

export const transformPublicProject = (
  project: PublicProjectInclude,
  locale: string
) => {
  return {
    id: project.id,
    slug: project.slug,
    title: localized(project.titleAr, project.titleEn, locale) ?? "",
    description: localized(
      project.descriptionAr,
      project.descriptionEn,
      locale
    ),
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
    deedNumber: project.deedNumber,
    googleMapsAddress: project.googleMapsAddress,
    startingPrice: project.startingPrice,
    endingPrice: project.endingPrice,
    cityName: localized(project.city.nameAr, project.city.nameEn, locale),
    regionName: localized(
      project.city.region.nameAr,
      project.city.region.nameEn,
      locale
    ),
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

/* ── Raw (bilingual) shape used by the edit form ────────────────── */

export const publicProjectEditInclude = {
  ...publicProjectInclude,
  attachments: true,
} satisfies Prisma.PublicProjectInclude

export type PublicProjectEditInclude = Prisma.PublicProjectGetPayload<{
  include: typeof publicProjectEditInclude
}>

export const transformPublicProjectForEdit = (
  project: PublicProjectEditInclude
) => {
  return {
    id: project.id,
    titleAr: project.titleAr,
    titleEn: project.titleEn,
    slug: project.slug,
    descriptionAr: project.descriptionAr ?? "",
    descriptionEn: project.descriptionEn ?? "",
    shortDescriptionAr: project.shortDescriptionAr ?? "",
    shortDescriptionEn: project.shortDescriptionEn ?? "",
    images: project.images,
    isActive: project.isActive,
    status: project.status,
    projectId: project.projectId ?? "",
    locationAr: project.locationAr ?? "",
    locationEn: project.locationEn ?? "",
    area: project.area ?? "",
    deedNumber: project.deedNumber ?? "",
    googleMapsAddress: project.googleMapsAddress ?? "",
    startingPrice: project.startingPrice ?? "",
    endingPrice: project.endingPrice ?? "",
    cityId: project.cityId,
    regionId: project.city.region.id,
    categoryIds: project.categories.map((c) => c.id),
    badges: project.badge.map((b) => ({
      nameAr: b.nameAr,
      nameEn: b.nameEn,
      color: b.color,
    })),
    features: project.features.map((f) => ({
      labelAr: f.labelAr,
      labelEn: f.labelEn,
      valueAr: f.valueAr ?? "",
      valueEn: f.valueEn ?? "",
      icon: f.icon,
    })),
    attachments: project.attachments.map((a) => ({
      fileUrl: a.fileUrl,
      fileName: a.fileName ?? undefined,
      fileType: a.fileType ?? undefined,
      fileSize: a.fileSize ?? undefined,
      additionalInfo: a.additionalInfo ?? undefined,
    })),
  }
}

export type PublicProjectEditData = ReturnType<
  typeof transformPublicProjectForEdit
>
