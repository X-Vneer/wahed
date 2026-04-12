"use client"

import type { UploadedFileAttachment } from "@/components/form-file-upload"
import type {
  PublicProjectBadgeInput,
  PublicProjectFeatureInput,
} from "@/lib/schemas/public-project"
import { createFormContext } from "@mantine/form"
import type { PROJECT_STATUSES } from "./public-project-form-constants"

export type PublicProjectFormStatus = "" | (typeof PROJECT_STATUSES)[number]

export type PublicProjectFormBadge = PublicProjectBadgeInput
export type PublicProjectFormFeature = PublicProjectFeatureInput

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
  deedNumber: string
  googleMapsAddress: string
  status: PublicProjectFormStatus
  cityId: string
  categoryIds: string[]
  badges: PublicProjectFormBadge[]
  features: PublicProjectFormFeature[]
  startingPrice: string | number
  endingPrice: string | number
  attachments: UploadedFileAttachment[]
  /** Internal project attachments from prefill; user toggles inclusion via `selectedLinkedFileUrls`. */
  linkedAttachmentCandidates: UploadedFileAttachment[]
  selectedLinkedFileUrls: string[]
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
    deedNumber: "",
    googleMapsAddress: "",
    status: "",
    cityId: "",
    categoryIds: [],
    badges: [],
    features: [],
    startingPrice: "",
    endingPrice: "",
    attachments: [],
    linkedAttachmentCandidates: [],
    selectedLinkedFileUrls: [],
  }
}

export const [
  PublicProjectFormProvider,
  usePublicProjectFormContext,
  usePublicProjectForm,
] = createFormContext<PublicProjectFormValues>()
