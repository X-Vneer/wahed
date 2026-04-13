import * as z from "zod/v4"
import { attachmentSchema } from "@/lib/schemas/attachment"
import { ProjectStatusEnum } from "@/lib/schemas/project"

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function optionalNumber() {
  return z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : val,
    z.coerce.number().positive().optional()
  )
}

export const publicProjectBadgeSchema = z.object({
  nameAr: z.string().min(1, { error: "badgeNameArRequired" }),
  nameEn: z.string().min(1, { error: "badgeNameEnRequired" }),
  color: z.string().min(1, { error: "badgeColorRequired" }),
})

export type PublicProjectBadgeInput = z.infer<typeof publicProjectBadgeSchema>

export const publicProjectFeatureSchema = z.object({
  labelAr: z.string().min(1, { error: "featureLabelArRequired" }),
  labelEn: z.string().min(1, { error: "featureLabelEnRequired" }),
  valueAr: z.string().optional().default(""),
  valueEn: z.string().optional().default(""),
  icon: z.string().optional().default(""),
})

export type PublicProjectFeatureInput = z.infer<
  typeof publicProjectFeatureSchema
>

export const createPublicProjectSchema = z.object({
  titleAr: z.string().min(1, { error: "titleArRequired" }),
  titleEn: z.string().min(1, { error: "titleEnRequired" }),
  slug: z
    .string()
    .min(1, { error: "slugRequired" })
    .min(3, { error: "slugMinLength" })
    .regex(slugRegex, { error: "slugInvalid" }),
  descriptionAr: z.string().min(1, { error: "descriptionArRequired" }),
  descriptionEn: z.string().min(1, { error: "descriptionEnRequired" }),
  shortDescriptionAr: z
    .string()
    .min(1, { error: "shortDescriptionArRequired" }),
  shortDescriptionEn: z
    .string()
    .min(1, { error: "shortDescriptionEnRequired" }),
  images: z.array(z.string().min(1)).min(5, { error: "imagesMinFive" }),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  projectGuide: z.string().optional(),
  projectId: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : String(v)),
    z.string().min(1).optional()
  ),
  locationAr: z.string().optional(),
  locationEn: z.string().optional(),
  area: optionalNumber(),
  deedNumber: z.string().optional(),
  googleMapsAddress: z.string().optional(),
  status: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    ProjectStatusEnum.optional()
  ),
  cityId: z.string().min(1, { error: "cityIdRequired" }),
  categoryIds: z.array(z.string()).default([]),
  badges: z.array(publicProjectBadgeSchema).default([]),
  features: z.array(publicProjectFeatureSchema).default([]),
  startingPrice: optionalNumber(),
  endingPrice: optionalNumber(),
  attachments: z.array(attachmentSchema).optional().default([]),
})

export type CreatePublicProjectInput = z.infer<typeof createPublicProjectSchema>

/** Includes `regionId` and linked-project attachment UI state; merge `attachments` before POST. */
export const publicProjectFormSchema = createPublicProjectSchema
  .omit({ attachments: true })
  .extend({
    regionId: z.string().min(1, { error: "regionIdRequired" }),
    /** Newly uploaded files only; linked project files live in `linkedAttachmentCandidates`. */
    attachments: z.array(attachmentSchema).default([]),
    linkedAttachmentCandidates: z.array(attachmentSchema).default([]),
    selectedLinkedFileUrls: z.array(z.string()).default([]),
  })

export type PublicProjectFormInput = z.infer<typeof publicProjectFormSchema>

/** One schema per wizard step; used with `safeParse(form.values)` for step navigation. */
export const publicProjectFormStepSchemas = [
  publicProjectFormSchema.pick({
    titleAr: true,
    titleEn: true,
    slug: true,
    isActive: true,
    isFeatured: true,
    projectId: true,
    shortDescriptionAr: true,
    shortDescriptionEn: true,
    descriptionAr: true,
    descriptionEn: true,
  }),
  publicProjectFormSchema.pick({
    images: true,
    attachments: true,
    projectGuide: true,
  }),
  publicProjectFormSchema.pick({
    regionId: true,
    cityId: true,
    locationAr: true,
    locationEn: true,
    googleMapsAddress: true,
    area: true,
    deedNumber: true,
    status: true,
  }),
  publicProjectFormSchema.pick({
    categoryIds: true,
    badges: true,
    features: true,
    startingPrice: true,
    endingPrice: true,
  }),
] as const

export const PUBLIC_PROJECT_FORM_STEP_COUNT =
  publicProjectFormStepSchemas.length
