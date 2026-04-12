import type { ProjectStatus } from "@/lib/generated/prisma/enums"

export type PublicProjectPrefillResponse = {
  projectId: string
  titleAr: string
  titleEn: string
  descriptionAr: string | null
  descriptionEn: string | null
  shortDescriptionAr: string | null
  shortDescriptionEn: string | null
  cityId: string
  regionId: string
  area: number | null
  deedNumber: string | null
  googleMapsAddress: string | null
  status: ProjectStatus
  categoryIds: string[]
  images: string[]
  attachments: Array<{
    fileUrl: string
    fileName: string | null
    fileType: string | null
    fileSize: number | null
  }>
  suggestedSlug: string
}
