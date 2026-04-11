"use client"

import type { UploadedFileAttachment } from "@/components/form-file-upload"
import { createFormContext } from "@mantine/form"
import type { PROJECT_STATUSES } from "./public-project-form-constants"

export type PublicProjectFormStatus = "" | (typeof PROJECT_STATUSES)[number]

export type PublicProjectFormValues = {
  regionId: string
  titleAr: string
  titleEn: string
  slug: string
  descriptionAr: string
  descriptionEn: string
  shortDescriptionAr: string
  shortDescriptionEn: string
  images: string[]
  isActive: boolean
  projectId: string
  locationAr: string
  locationEn: string
  area: string | number
  numberOfFloors: string | number
  deedNumber: string
  workDuration: string | number
  googleMapsAddress: string
  status: PublicProjectFormStatus
  cityId: string
  categoryIds: string[]
  badgeIds: string[]
  featureIds: string[]
  startingPrice: string | number
  endingPrice: string | number
  attachments: UploadedFileAttachment[]
}

export function getPublicProjectFormInitialValues(
  linkedProjectId?: string | null
): PublicProjectFormValues {
  return {
    regionId: "",
    titleAr: "",
    titleEn: "",
    slug: "",
    descriptionAr: "",
    descriptionEn: "",
    shortDescriptionAr: "",
    shortDescriptionEn: "",
    images: [],
    isActive: true,
    projectId: linkedProjectId ?? "",
    locationAr: "",
    locationEn: "",
    area: "",
    numberOfFloors: "",
    deedNumber: "",
    workDuration: "",
    googleMapsAddress: "",
    status: "",
    cityId: "",
    categoryIds: [],
    badgeIds: [],
    featureIds: [],
    startingPrice: "",
    endingPrice: "",
    attachments: [],
  }
}

export const [
  PublicProjectFormProvider,
  usePublicProjectFormContext,
  usePublicProjectForm,
] = createFormContext<PublicProjectFormValues>()
